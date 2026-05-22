import type { MenuSection } from "../types";

export const MENU: MenuSection[] = [
  {
    label: "Department",
    icon: "Building2",
    children: [
      { label: "Engineering" },
      { label: "Customer Support" },
      { label: "Sales" },
      { label: "Marketing" },
      { label: "Supply Chain" },
      { label: "Human Resource" },
      { label: "Finance & Accounting" },
      { label: "Procurement" },
      { label: "Logistic" },
    ],
  },
  {
    label: "Employee Profile",
    icon: "UserCircle",
    children: [
      { label: "Experience" },
      { label: "Skill" },
      { label: "Performance Review" },
      { label: "Training" },
    ],
  },
  {
    label: "Integration",
    icon: "Plug",
    children: [
      { label: "ERP" },
      { label: "OpenClaw" },
      { label: "Database" },
      { label: "SaaS" },
    ],
  },
  {
    label: "Virtual Employees",
    icon: "Bot",
    children: [
      { label: "Accounting Assistant" },
    ],
  },
  { label: "Platform Settings", icon: "Settings" },
  { label: "Monitoring", icon: "Activity" },
];

export const DEPARTMENT_LABEL_TO_ID: Record<string, string> = {
  Engineering: "engineering",
  "Customer Support": "customer-support",
  Sales: "sales",
  Marketing: "marketing",
  "Supply Chain": "supply-chain",
  "Human Resource": "human-resource",
  "Finance & Accounting": "finance",
  Procurement: "procurement",
  Logistic: "logistic",
};
