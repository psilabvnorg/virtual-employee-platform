import fs from 'fs';
import path from 'path';

export class JsonStore<T extends { id: string }> {
  constructor(private filePath: string) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
  }

  getAll(): T[] {
    return JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as T[];
  }

  getById(id: string): T | undefined {
    return this.getAll().find((item) => item.id === id);
  }

  add(item: T): void {
    const items = this.getAll();
    items.push(item);
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  update(id: string, patch: Partial<T>): void {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) throw new Error(`Record ${id} not found`);
    items[idx] = { ...items[idx], ...patch };
    fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  seed(defaults: T[]): void {
    if (this.getAll().length === 0) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaults, null, 2), 'utf-8');
    }
  }
}
