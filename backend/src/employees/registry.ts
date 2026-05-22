import path from 'path';
import { Express } from 'express';
import { BaseEmployee } from './base/BaseEmployee';
import { createEmployeeRouter } from './base/BaseRouter';
import { AccountingEmployee } from './accounting/AccountingEmployee';

const DATA_DIR = path.join(__dirname, '../../data/employees');

const employeeMap = new Map<string, BaseEmployee>();

export function registerEmployees(app: Express): void {
  const employees: BaseEmployee[] = [
    new AccountingEmployee(path.join(DATA_DIR, 'accounting')),
    // Add new virtual employees here — routes mount automatically
  ];

  for (const emp of employees) {
    employeeMap.set(emp.name, emp);
    const router = createEmployeeRouter(emp, path.join(DATA_DIR, emp.name));
    app.use(`/api/employees/${emp.name}`, router);
    console.log(`[employees] Registered: ${emp.label} → /api/employees/${emp.name}`);
  }
}

export function getEmployee(name: string): BaseEmployee | undefined {
  return employeeMap.get(name);
}

export function listEmployees(): { name: string; label: string }[] {
  return Array.from(employeeMap.values()).map((e) => ({ name: e.name, label: e.label }));
}
