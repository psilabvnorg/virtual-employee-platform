# Virtual Employee Platform

An interactive 3D visualization of a virtual employee organization, showcasing how AI-powered departments collaborate and operate within a modern enterprise.

## Overview

This web application presents an isometric 3D view of a complete virtual workforce organized into 9 departments with over 550 virtual employees. Users can explore the organizational structure, view department details, and understand how different teams interact through visual connection streams.

## Features

- **Interactive 3D Scene**: Orbit and explore an isometric view of the entire organization
- **Department Nodes**: Click on any department to view detailed information including:
  - Headcount and active employee metrics
  - Role breakdowns with levels (L1-L6)
  - Department descriptions and responsibilities
  - Inter-department relationships
- **Real-time Visualization**: Animated connection streams showing data flow between departments
- **Responsive UI**: Clean sidebar navigation and detail panels

## Departments

The platform visualizes 9 core departments:

- **Engineering** (142 employees) - Software development, ML, SRE, and QA
- **Customer Support** (96 employees) - Tier 1-3 agents and knowledge management
- **Sales** (74 employees) - SDRs, account executives, and solutions engineers
- **Marketing** (52 employees) - Content, growth, and lifecycle marketing
- **Supply Chain** (63 employees) - Demand planning and inventory optimization
- **Human Resource** (28 employees) - People ops, recruiting, and L&D
- **Finance & Accounting** (41 employees) - AR/AP, controllership, and FP&A
- **Procurement** (22 employees) - Sourcing, contracting, and supplier management
- **Logistic** (35 employees) - Dispatch, routing, and last-mile coordination

## Tech Stack

- **React** + **TypeScript** - UI framework and type safety
- **Three.js** + **React Three Fiber** - 3D rendering and scene management
- **@react-three/drei** - 3D helpers and abstractions
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to the local development server (typically `http://localhost:5173`)

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── scene/          # 3D scene components
│   ├── BrandStrip.tsx  # Left brand sidebar
│   ├── Sidebar.tsx     # Navigation menu
│   ├── TopBar.tsx      # Top navigation bar
│   └── DetailPanel.tsx # Department detail view
├── data/
│   ├── departments.ts  # Department data and relationships
│   └── menu.ts         # Navigation menu structure
├── store/
│   └── useAppStore.ts  # Zustand state management
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## Usage

1. **Explore**: Drag to orbit the 3D scene and view the organization from different angles
2. **Inspect**: Click on any department node to open the detail panel
3. **Navigate**: Use the sidebar menu to access different views and features
4. **Observe**: Watch the animated connection streams showing data flow between departments

## License

Private project - All rights reserved
