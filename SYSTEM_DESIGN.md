# Virtual Employee Platform — System Design

## App Description

The **Virtual Employee Platform** is an enterprise visualization and document-management product that makes an AI-powered workforce tangible. It presents 550+ virtual employees across 9 business departments as an interactive isometric 3D scene, letting operators explore organizational structure, departmental relationships, and live utilization data at a glance. A companion mobile PWA lets field staff capture physical documents (invoices, contracts, IDs) with their phone camera; those documents flow through a backend OCR pipeline and become searchable within seconds.

The product has three distinct surfaces:

| Surface | Audience | Core Job |
|---------|----------|----------|
| **3D Web App** | Operators / executives | Explore the virtual workforce, inspect department metrics |
| **Mobile PWA** | Field staff | Capture and search physical documents on the go |
| **Backend API** | Both surfaces | OCR pipeline, document storage, search index |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Desktop)                     │
│  ┌───────────┐  ┌────────────────────────────────────┐  │
│  │ Sidebar   │  │  Three.js Scene (WebGL)            │  │
│  │ TopBar    │  │  ┌──────────┐ ┌────────────────┐  │  │
│  │ Detail    │  │  │ TopLayer │ │ ConnectionStreams│  │  │
│  │ Panel     │  │  │ PSILayer │ │ BottomLayer    │  │  │
│  └─────┬─────┘  │  └──────────┘ └────────────────┘  │  │
│        │Zustand  └────────────────────────────────────┘  │
│        └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Mobile PWA (Android / iOS)              │
│  Camera → Capture → IndexedDB Queue → Upload → Search   │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼─────────────────────────────┐
│                   Backend API (Express)                  │
│  /upload → Storage Adapter → /ocr → Google Sheets Index │
│                                ↓                        │
│              Google Drive   /  S3  /  SFTP  /  Azure    │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Frontend — 3D Web Application

### Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| UI framework | React | 18.3 |
| Language | TypeScript | 5.6 |
| 3D engine | Three.js + @react-three/fiber | 0.169 / 8.17 |
| 3D helpers | @react-three/drei | 9.114 |
| State | Zustand | 4.5 |
| Styling | Tailwind CSS | 3.4 |
| Build | Vite | 5.4 |
| Icons | Lucide React | 0.453 |

### Component Tree

```
App
├── BrandStrip          — Vertical left rail; PSI logo; live-status pulse
├── Sidebar             — Collapsible nav (Departments · Profiles · Integration · Settings · Monitoring)
├── TopBar              — Breadcrumb, search, "PSI · LIVE" badge
├── <main>
│   ├── Scene           — Three.js Canvas; OrbitControls (drag-to-rotate only)
│   │   ├── TopLayer    — Decorative top visual layer
│   │   ├── PSILayer    — Department nodes + relationship edges on shared platform
│   │   │   ├── Platform
│   │   │   ├── DepartmentNode × 9
│   │   │   └── Edge lines (dashed)
│   │   ├── BottomLayer — Decorative bottom visual layer
│   │   └── ConnectionStreams — Animated data-flow particles
│   ├── SceneOverlay    — HUD corner ticks, instructions
│   └── DetailPanel     — Right drawer; department metrics, roles, relations
```

### 3D Scene Design

The scene uses a **fixed isometric camera** (`position [10, 7.5, 13]`, FOV 32) with OrbitControls locked to rotation only (no zoom, no pan, speed 0.5). Three stacked layers give visual depth:

- **TopLayer / BottomLayer** — Decorative geometry and ambient lighting
- **PSILayer (Y = 0.13)** — The main department plane. Each of the 9 departments is a `DepartmentNode`: a box mesh with one of three silhouette variants, interactive hover (+0.25 Y lift, smooth interpolation) and selection (+0.55 Y lift, selection halo). Relationship edges render as dashed `<Line>` primitives between node pairs.
- **ConnectionStreams** — Particle streams following predefined TOP_STREAMS and BOTTOM_STREAMS paths, representing live data flow between departments.

### State Management

Zustand store (`useAppStore`) owns all cross-component state:

```typescript
interface AppStore {
  selectedMenuPath: string[];          // Breadcrumb trail
  selectedDepartmentId: string | null; // Active department (drives 3D + panel)
  hoveredDepartmentId: string | null;  // Hover feedback
  panelOpen: boolean;                  // Detail panel visibility
  // actions omitted for brevity
}
```

Sidebar navigation writes to `selectedDepartmentId`; the 3D scene reads it to animate the node and subscribes to hover events independently. The `DetailPanel` reads from the same store, making selection the single source of truth.

### Data Model

All static data lives in `src/data/departments.ts`. Each department:

```typescript
interface Department {
  id: string;
  name: string;
  shortLabel: string;
  headcount: number;
  active: number;               // Utilization count
  description: string;
  roles: Role[];                // title, count, level (L1–L6)
  position: [number, number, number]; // 3D placement
  relations: Relation[];        // { target: string; verb: string }
}
```

Nine departments, 550+ total employees:

| # | Department | Employees |
|---|-----------|-----------|
| 1 | Engineering | 142 |
| 2 | Customer Support | 96 |
| 3 | Sales | 74 |
| 4 | Supply Chain | 63 |
| 5 | Marketing | 52 |
| 6 | Logistic | 35 |
| 7 | Finance & Accounting | 41 |
| 8 | Human Resource | 28 |
| 9 | Procurement | 22 |

### Design Language

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#f5f5f5` | Page background |
| `ink` | `#0a0a0a` | Text, dark surfaces |
| `accent` | `#00d97e` | Active states, live badges |
| `line` | `#111111` | Borders |
| Mono font | JetBrains Mono | Labels, metadata |
| Sans font | Inter | Body copy |

---

## 2. Mobile PWA

### Tech Stack

| Layer | Choice |
|-------|--------|
| UI framework | React 18 + React Router |
| Build | Vite + vite-plugin-pwa |
| Offline storage | IndexedDB via `idb` |
| Styling | Tailwind CSS |
| Proxy target | Backend API on port 3001 |

### User Flow

```
Category Select
      │
      ▼
  Capture (camera / gallery, multi-photo)
      │
      ▼
  Review & Upload (set date, submit)
      │
      ▼
  OCR (manual trigger or nightly schedule)
      │
      ▼
  Search (full-text, filter by category / year)
```

### Offline Strategy

Photos captured without connectivity are queued in **IndexedDB**. A service worker monitors network state and auto-uploads the queue when connectivity returns. This makes the app usable in low-connectivity environments (warehouses, field offices).

---

## 3. Backend API

### Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Scheduling | node-cron |
| File uploads | Multer |
| Storage adapters | Google Drive, S3, SFTP, Azure Blob |
| Metadata index | Google Sheets |
| OCR | Pluggable normalizer templates per category |

### API Surface

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Accept photo file with `category` + `date`, write to active storage adapter |
| `POST` | `/ocr/trigger` | Trigger OCR for a specific file |
| `POST` | `/ocr/batch` | Manual full-batch OCR run |
| `GET` | `/search` | Search by `category`, `date`, or full-text query |

### Storage Adapter Pattern

The backend uses a pluggable adapter interface so the storage backend can be swapped without changing application code:

```
StorageAdapter
├── GoogleDriveAdapter   (default)
├── S3Adapter
├── SFTPAdapter
└── AzureBlobAdapter
```

### OCR Pipeline

1. File arrives at `/upload` → stored via active adapter → metadata written to Google Sheets row
2. OCR runs on demand (`/ocr/trigger`) or nightly at 02:00 via node-cron
3. Each document category has a **normalizer template** that extracts structured fields (e.g., invoice number, total, vendor) from raw OCR text
4. Extracted fields are written back to the Google Sheets index row
5. `/search` queries the Sheets index for fast lookup; full-text matches against stored OCR text

### Google Sheets as Metadata Index

| Column | Content |
|--------|---------|
| File ID | Storage adapter reference |
| Category | Invoice · Contract · Certificate · Gov ID · Receipt · Other |
| Date | Capture date |
| OCR Text | Raw extracted text |
| Structured Fields | JSON blob from normalizer |
| Status | pending · ocr\_done · error |

---

## 4. Key Design Decisions

### Why Three.js + react-three/fiber?
The isometric org-chart concept needs real-time 3D interactions (hover lift, animated streams, orbit) that would be impractical in SVG/CSS. React-three/fiber integrates cleanly into the React component model while Three.js provides the rendering power.

### Why Zustand?
The app has shallow, cross-cutting state (selected department drives 3D, sidebar, and detail panel simultaneously). Zustand's minimal boilerplate and selector-based subscriptions avoid the over-engineering of Redux for this use case.

### Why Google Sheets as a metadata index?
Google Sheets provides a zero-ops, instantly queryable store visible to non-technical operators without any database administration. It is the right trade-off for the current scale (thousands of documents, not millions).

### Why IndexedDB for the mobile offline queue?
Service workers + IndexedDB is the standard PWA offline strategy. It survives app restarts and browser updates, unlike in-memory state, making it reliable for field workers who may not have connectivity for hours.

---

## 5. Development Setup

### Frontend (port 5173)
```bash
cd d:\AI\virtual-employee-platform
npm install
npm run dev
```

### Backend (port 3001)
```bash
cd backend
npm install
npm run dev
```

### Mobile PWA (port 5174, proxies /api → localhost:3001)
```bash
cd mobile
npm install
npm run dev
```

---

## 6. Build & Deployment

### Frontend
```bash
npm run build   # TypeScript check + Vite bundle → dist/
npm run preview # Serve dist/ locally
```

### Backend
```bash
npm run build   # tsc → dist/
npm run start   # node dist/index.js
```

### Mobile
```bash
npm run build   # Vite + PWA manifest → mobile/dist/
```

The frontend and mobile builds produce static files that can be served from any CDN or static host. The backend is a stateful Node.js process that requires access to Google credentials and (optionally) S3/Azure credentials via environment variables.

---

## 7. File Map (Key Files)

| Path | Role |
|------|------|
| [src/App.tsx](src/App.tsx) | Root layout — assembles all panels and the scene |
| [src/components/scene/Scene.tsx](src/components/scene/Scene.tsx) | Three.js Canvas, camera, lighting |
| [src/components/scene/PSILayer.tsx](src/components/scene/PSILayer.tsx) | Department nodes + edges |
| [src/components/scene/DepartmentNode.tsx](src/components/scene/DepartmentNode.tsx) | Single interactive 3D node |
| [src/components/scene/ConnectionStreams.tsx](src/components/scene/ConnectionStreams.tsx) | Animated data-flow particles |
| [src/data/departments.ts](src/data/departments.ts) | All department + employee data |
| [src/store/useAppStore.ts](src/store/useAppStore.ts) | Zustand global state |
| [src/components/DetailPanel.tsx](src/components/DetailPanel.tsx) | Right drawer — metrics, roles, relations |
| [src/components/Sidebar.tsx](src/components/Sidebar.tsx) | Left nav — drives selection state |
| [tailwind.config.js](tailwind.config.js) | Design tokens (colors, fonts) |
| [backend/src/index.ts](backend/src/index.ts) | Express entry point, route registration |
| [mobile/src/App.tsx](mobile/src/App.tsx) | Mobile PWA root, React Router setup |
| [vite.config.ts](vite.config.ts) | Frontend build config |
