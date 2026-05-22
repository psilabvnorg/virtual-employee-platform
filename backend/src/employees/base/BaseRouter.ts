import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { BaseEmployee } from './BaseEmployee';
import { JsonStore } from '../../services/store/JsonStore';
import { ollamaChat } from '../../services/llm/OllamaService';

export interface EmployeeRecord {
  id: string;
  fileId: string;
  driveUrl: string;
  category: string;
  ocrText: string;
  normalizedJson: Record<string, unknown>;
  suggestions: unknown[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PromptTemplate {
  id: string; // same as name
  name: string;
  category: string;
  standard: string;
  content: string;
}

export function createEmployeeRouter(employee: BaseEmployee, dataDir: string): Router {
  const router = Router();
  const records = new JsonStore<EmployeeRecord>(path.join(dataDir, 'records.json'));
  const prompts = new JsonStore<PromptTemplate>(path.join(dataDir, 'prompts.json'));

  // List records — ?status=pending|approved|rejected
  router.get('/records', (req: Request, res: Response) => {
    let all = records.getAll();
    if (req.query.status) all = all.filter((r) => r.status === req.query.status);
    res.json(all);
  });

  // Get single record
  router.get('/records/:id', (req: Request, res: Response) => {
    const record = records.getById(String(req.params.id));
    if (!record) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(record);
  });

  // Approve
  router.post('/records/:id/approve', (req: Request, res: Response) => {
    try {
      records.update(String(req.params.id), {
        status: 'approved',
        reviewNote: req.body.reviewNote,
        reviewedAt: new Date().toISOString(),
      });
      res.json({ ok: true });
    } catch { res.status(404).json({ error: 'Not found' }); }
  });

  // Reject
  router.post('/records/:id/reject', (req: Request, res: Response) => {
    try {
      records.update(String(req.params.id), {
        status: 'rejected',
        reviewNote: req.body.reviewNote,
        reviewedAt: new Date().toISOString(),
      });
      res.json({ ok: true });
    } catch { res.status(404).json({ error: 'Not found' }); }
  });

  // List prompts
  router.get('/prompts', (_req: Request, res: Response) => {
    res.json(prompts.getAll());
  });

  // Update prompt content
  router.put('/prompts/:name', (req: Request, res: Response) => {
    try {
      prompts.update(String(req.params.name), { content: req.body.content });
      res.json({ ok: true });
    } catch { res.status(404).json({ error: 'Prompt not found' }); }
  });

  // Chat — Ollama answers using approved records as context
  router.post('/chat', async (req: Request, res: Response) => {
    const { message } = req.body as { message: string };
    const approved = records.getAll().filter((r) => r.status === 'approved').slice(-30);
    const context = JSON.stringify(approved);
    const system = `You are a helpful ${employee.label} assistant. Use the following approved records as context:\n${context}\nAnswer concisely and in the same language as the user's question.`;
    try {
      const reply = await ollamaChat(system, message);
      res.json({ reply });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Internal: process a document (called by scheduler or upload)
  router.post('/process', async (req: Request, res: Response) => {
    const { fileId, driveUrl, category, ocrText } = req.body as {
      fileId: string; driveUrl: string; category: string; ocrText: string;
    };
    try {
      const result = await employee.process(ocrText, category);
      const record: EmployeeRecord = {
        id: uuid(),
        fileId, driveUrl, category, ocrText,
        normalizedJson: result.normalizedJson,
        suggestions: result.suggestions,
        confidence: result.confidence,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      records.add(record);
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
}
