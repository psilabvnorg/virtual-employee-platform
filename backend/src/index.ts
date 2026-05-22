import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import uploadRouter from './routes/upload';
import ocrRouter from './routes/ocr';
import searchRouter from './routes/search';
import { startScheduler } from './services/scheduler';
import { registerEmployees, listEmployees } from './employees/registry';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/upload', uploadRouter);
app.use('/ocr', ocrRouter);
app.use('/search', searchRouter);

registerEmployees(app);

app.get('/api/employees', (_req, res) => {
  res.json(listEmployees());
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Doc Vault backend listening on port ${port}`);
  startScheduler();
});
