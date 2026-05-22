export interface VirtualEmployee {
  id: string;
  label: string;
  description: string;
}

export const VIRTUAL_EMPLOYEES: VirtualEmployee[] = [
  {
    id: "accounting",
    label: "Accounting Assistant",
    description: "Processes invoices, contracts, labor contracts, tax, and insurance documents. Extracts structured data and suggests double-entry journal entries following VAS standards.",
  },
];

export const VIRTUAL_EMPLOYEE_LABEL_TO_ID: Record<string, string> = {
  "Accounting Assistant": "accounting",
};

export const API_BASE = "/api";
