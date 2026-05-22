import path from 'path';
import { BaseEmployee, ProcessResult } from '../base/BaseEmployee';
import { JsonStore } from '../../services/store/JsonStore';
import { PromptTemplate } from '../base/BaseRouter';
import { ollamaChat, extractJson, extractJsonArray } from '../../services/llm/OllamaService';

export class AccountingEmployee extends BaseEmployee {
  readonly name = 'accounting';
  readonly label = 'Accounting Assistant';

  private prompts: JsonStore<PromptTemplate>;

  constructor(dataDir: string) {
    super();
    this.prompts = new JsonStore<PromptTemplate>(path.join(dataDir, 'prompts.json'));
    this.seedDefaultPrompts(dataDir);
  }

  private seedDefaultPrompts(dataDir: string): void {
    try {
      const defaultPath = path.join(__dirname, '../../../data/employees/accounting/prompts.json');
      const fs = require('fs');
      if (fs.existsSync(defaultPath) && this.prompts.getAll().length === 0) {
        const defaults = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
        this.prompts.seed(defaults);
      }
    } catch {
      // no defaults available, continue
    }
  }

  private getPromptContent(name: string): string {
    return this.prompts.getById(name)?.content ?? '';
  }

  async process(ocrText: string, category: string): Promise<ProcessResult> {
    const promptName = `extract_${category}`;
    const extractPrompt = this.getPromptContent(promptName) || this.getPromptContent('extract_other');

    let normalizedJson: Record<string, unknown> = {};
    let confidence = 0.5;

    if (extractPrompt) {
      try {
        const raw = await ollamaChat(extractPrompt, ocrText);
        const parsed = extractJson(raw);
        if (parsed) {
          normalizedJson = parsed;
          confidence = 0.85;
        }
      } catch (err) {
        console.error(`[accounting] extraction failed:`, err);
      }
    }

    const journalPrompt = this.getPromptContent('generate_journal_entry');
    let suggestions: unknown[] = [];

    if (journalPrompt) {
      try {
        const input = JSON.stringify({ category, data: normalizedJson });
        const raw = await ollamaChat(journalPrompt, input);
        const parsed = extractJsonArray(raw);
        if (parsed) suggestions = parsed;
      } catch (err) {
        console.error(`[accounting] journal generation failed:`, err);
      }
    }

    return { normalizedJson, suggestions, confidence };
  }
}
