export type DepartmentId =
  | "engineering"
  | "customer-support"
  | "sales"
  | "marketing"
  | "supply-chain"
  | "human-resource"
  | "finance"
  | "procurement"
  | "logistic";

export type Department = {
  id: DepartmentId;
  name: string;
  shortLabel: string;
  headcount: number;
  active: number;
  description: string;
  roles: { title: string; count: number; level: string }[];
  position: [number, number, number];
  relations: { to: DepartmentId; verb: string }[];
};

export type MenuLeaf = { label: string };
export type MenuSection = {
  label: string;
  icon: string; // lucide icon name
  children?: MenuLeaf[];
};
