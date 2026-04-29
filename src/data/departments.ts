import type { Department, DepartmentId } from "../types";

export const DEPARTMENTS: Department[] = [
  {
    id: "engineering",
    name: "Engineering",
    shortLabel: "ENG",
    headcount: 142,
    active: 128,
    description:
      "Virtual software engineers building, testing, and shipping internal tooling and customer-facing services.",
    roles: [
      { title: "Backend Engineer", count: 38, level: "L3-L5" },
      { title: "Frontend Engineer", count: 31, level: "L2-L5" },
      { title: "Site Reliability", count: 14, level: "L4-L5" },
      { title: "ML Engineer", count: 19, level: "L4-L6" },
      { title: "QA Automation", count: 12, level: "L2-L4" },
    ],
    position: [-5.4, 0.4, -2.1],
    relations: [
      { to: "customer-support", verb: "Delivers" },
      { to: "marketing", verb: "Equips" },
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support",
    shortLabel: "CS",
    headcount: 96,
    active: 88,
    description:
      "Tier 1-3 virtual agents handling tickets, chat, and proactive outreach, escalating to engineering when needed.",
    roles: [
      { title: "Tier 1 Agent", count: 42, level: "L1-L2" },
      { title: "Tier 2 Specialist", count: 28, level: "L2-L3" },
      { title: "Escalation Lead", count: 8, level: "L4" },
      { title: "Knowledge Curator", count: 10, level: "L3" },
    ],
    position: [-2.1, 0.4, -2.4],
    relations: [
      { to: "engineering", verb: "Reports" },
      { to: "sales", verb: "Hands off" },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    shortLabel: "SLS",
    headcount: 74,
    active: 71,
    description:
      "Outbound and inbound virtual sales reps qualifying leads, running discovery calls, and closing mid-market deals.",
    roles: [
      { title: "SDR", count: 30, level: "L1-L2" },
      { title: "Account Executive", count: 22, level: "L3-L4" },
      { title: "Solutions Engineer", count: 12, level: "L4" },
      { title: "Sales Ops", count: 10, level: "L3" },
    ],
    position: [1.4, 0.4, -2.1],
    relations: [
      { to: "marketing", verb: "Transacts" },
      { to: "finance", verb: "Generates" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    shortLabel: "MKT",
    headcount: 52,
    active: 50,
    description:
      "Content, growth, and lifecycle marketing virtual employees orchestrating campaigns and analytics loops.",
    roles: [
      { title: "Content Strategist", count: 14, level: "L3" },
      { title: "Growth Analyst", count: 12, level: "L3-L4" },
      { title: "Lifecycle Marketer", count: 16, level: "L2-L3" },
      { title: "Brand Designer", count: 10, level: "L3" },
    ],
    position: [4.6, 0.4, -1.9],
    relations: [
      { to: "sales", verb: "Feeds" },
      { to: "customer-support", verb: "Informs" },
    ],
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    shortLabel: "SC",
    headcount: 63,
    active: 59,
    description:
      "Demand planning, vendor management, and inventory optimization virtual employees coordinating across regions.",
    roles: [
      { title: "Demand Planner", count: 18, level: "L3-L4" },
      { title: "Vendor Manager", count: 14, level: "L3" },
      { title: "Inventory Analyst", count: 21, level: "L2-L3" },
      { title: "Ops Lead", count: 10, level: "L4" },
    ],
    position: [-5.0, 0.4, 0.6],
    relations: [
      { to: "procurement", verb: "Orders" },
      { to: "logistic", verb: "Routes" },
    ],
  },
  {
    id: "human-resource",
    name: "Human Resource",
    shortLabel: "HR",
    headcount: 28,
    active: 27,
    description:
      "People operations virtual employees handling onboarding, training assignment, and policy compliance.",
    roles: [
      { title: "People Ops", count: 9, level: "L2-L3" },
      { title: "Recruiter", count: 8, level: "L3" },
      { title: "L&D Coordinator", count: 7, level: "L3" },
      { title: "Compliance", count: 4, level: "L4" },
    ],
    position: [-1.6, 0.4, 0.4],
    relations: [
      { to: "engineering", verb: "Trains" },
      { to: "finance", verb: "Reports" },
    ],
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    shortLabel: "FIN",
    headcount: 41,
    active: 39,
    description:
      "AR/AP, controllership, and FP&A virtual employees closing books and producing real-time financial views.",
    roles: [
      { title: "AP Specialist", count: 12, level: "L2-L3" },
      { title: "AR Specialist", count: 10, level: "L2-L3" },
      { title: "Controller", count: 6, level: "L5" },
      { title: "FP&A Analyst", count: 13, level: "L3-L4" },
    ],
    position: [2.1, 0.4, 0.6],
    relations: [
      { to: "sales", verb: "Reconciles" },
      { to: "procurement", verb: "Approves" },
    ],
  },
  {
    id: "procurement",
    name: "Procurement",
    shortLabel: "PRC",
    headcount: 22,
    active: 21,
    description:
      "Sourcing, contracting, and supplier-risk virtual employees negotiating vendors and approving purchase orders.",
    roles: [
      { title: "Sourcing Specialist", count: 8, level: "L3" },
      { title: "Contract Manager", count: 6, level: "L4" },
      { title: "Risk Analyst", count: 4, level: "L3" },
      { title: "Buyer", count: 4, level: "L2" },
    ],
    position: [5.0, 0.4, 0.4],
    relations: [
      { to: "supply-chain", verb: "Supplies" },
      { to: "finance", verb: "Submits" },
    ],
  },
  {
    id: "logistic",
    name: "Logistic",
    shortLabel: "LOG",
    headcount: 35,
    active: 33,
    description:
      "Dispatch, route optimization, and last-mile coordination virtual employees keeping shipments on time.",
    roles: [
      { title: "Dispatcher", count: 12, level: "L2-L3" },
      { title: "Route Optimizer", count: 8, level: "L3-L4" },
      { title: "Customs", count: 7, level: "L3" },
      { title: "Last-Mile Coord", count: 8, level: "L2" },
    ],
    position: [0.0, 0.4, 2.4],
    relations: [
      { to: "supply-chain", verb: "Transports" },
      { to: "customer-support", verb: "Notifies" },
    ],
  },
];

export const DEPARTMENT_BY_ID: Record<DepartmentId, Department> =
  DEPARTMENTS.reduce(
    (acc, d) => {
      acc[d.id] = d;
      return acc;
    },
    {} as Record<DepartmentId, Department>
  );
