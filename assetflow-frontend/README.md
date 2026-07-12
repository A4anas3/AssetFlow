# AssetFlow — Frontend

> **React 19 + Vite 8 + TailwindCSS 4** client for the AssetFlow Enterprise Asset Management ERP system.

The frontend provides a full-featured, role-aware UI for tracking organizational assets, managing allocations, resource bookings, maintenance workflows, inter-department transfers, inventory audits, and analytics reporting.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 8 | Dev server & bundler |
| **TailwindCSS** | 4 | Utility-first styling |
| **React Router DOM** | 7 | Client-side routing |
| **Axios** | 1.x | HTTP client with interceptors |
| **Oxlint** | 1.x | Fast JS/JSX linter |

No chart libraries — analytics charts are built with **pure SVG** for zero dependency overhead.

---

## Getting Started

### Prerequisites

- Node.js `>= 18`
- Backend API server running on `http://localhost:5000` (see `assetflow-backend/`)

### Install & Run

```bash
cd assetflow-frontend
npm install
npm run dev
```

The app runs at **http://localhost:3000** by default.

All `/api/*` requests are proxied to `http://localhost:5000` via the Vite dev server config — no CORS issues in development.

### Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Environment Variables

Create a `.env` file in `assetflow-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> The Vite proxy already handles `/api` rewrites in development. This variable is used as a fallback for production builds.

---

## Project Structure

```
assetflow-frontend/
├── public/                        # Static public assets
├── src/
│   ├── api/
│   │   └── axios.js               # Axios instance with base URL + auth interceptors
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.jsx      # Authenticated shell: sidebar, header, notifications
│   │       └── AuthLayout.jsx     # Unauthenticated layout wrapper for auth pages
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth state: user, login, logout
│   ├── pages/
│   │   ├── auth/                  # Login, Signup, ForgotPassword, ResetPassword
│   │   ├── dashboard/             # Dashboard — KPI cards, overdue alerts, activity feed
│   │   ├── assets/                # Asset list, create, edit, detail
│   │   ├── allocations/           # Allocation list, create, detail (with conflict detection)
│   │   ├── transfers/             # Transfer list, create, detail (approve/reject)
│   │   ├── bookings/              # Booking list, calendar view, create, detail
│   │   ├── maintenance/           # Maintenance list, create, detail (approve/assign/resolve)
│   │   ├── audits/                # Audit list, create, detail (verify assets, close cycle)
│   │   ├── reports/               # Reports & Analytics with SVG charts + data export
│   │   ├── notifications/         # Notifications inbox
│   │   ├── activity-logs/         # Admin system logs (module filter)
│   │   ├── profile/               # User profile view and edit
│   │   ├── settings/              # System settings (admin only)
│   │   └── organization/
│   │       ├── departments/       # Department list, create, edit
│   │       ├── categories/        # Asset category list, create, edit
│   │       └── employees/         # Employee directory, create, promote, transfer, deactivate
│   ├── routes/                    # Route guard components (ProtectedRoute etc.)
│   ├── App.jsx                    # Root router with all route definitions
│   ├── main.jsx                   # React DOM entry point
│   └── index.css                  # Global styles + Tailwind base
├── vite.config.js                 # Vite config with proxy + TailwindCSS plugin
└── package.json
```

---

## Routing

All routes are defined in [`src/App.jsx`](src/App.jsx).

| Path | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/forgot-password` | Forgot Password | Public |
| `/reset-password` | Reset Password | Public |
| `/dashboard` | Dashboard | All roles |
| `/assets` | Asset Catalog | All roles |
| `/assets/create` | Register Asset | Admin, Asset Manager |
| `/assets/:id` | Asset Detail | All roles |
| `/assets/:id/edit` | Edit Asset | Admin, Asset Manager |
| `/allocations` | Allocation List | Admin, Asset Manager |
| `/allocations/create` | Allocate Asset | Admin, Asset Manager |
| `/allocations/:id` | Allocation Detail | Admin, Asset Manager |
| `/transfers` | Transfer List | Admin, Asset Manager |
| `/transfers/create` | Create Transfer | All roles |
| `/transfers/:id` | Transfer Detail | All roles |
| `/bookings` | Booking List | All roles |
| `/bookings/calendar` | Booking Calendar | All roles |
| `/bookings/create` | Reserve Slot | All roles |
| `/bookings/:id` | Booking Detail | All roles |
| `/maintenance` | Maintenance List | All roles |
| `/maintenance/create` | Raise Maintenance | All roles |
| `/maintenance/:id` | Maintenance Detail | All roles |
| `/audits` | Audit List | Admin, Asset Manager |
| `/audits/create` | Create Audit | Admin, Asset Manager |
| `/audits/:id` | Audit Detail | All roles (auditors can verify) |
| `/reports` | Reports & Analytics | Admin, Asset Manager |
| `/notifications` | Notifications | All roles |
| `/activity-logs` | System Logs | Admin |
| `/profile` | My Profile | All roles |
| `/profile/edit` | Edit Profile | All roles |
| `/settings` | System Settings | Admin |
| `/organization/departments` | Departments Setup | Admin |
| `/organization/categories` | Categories Setup | Admin |
| `/organization/employees` | Employee Directory | Admin |
| `/organization/employees/create` | Register Employee | Admin |

---

## Role-Based Navigation

The sidebar and available routes are filtered based on the logged-in user's role:

| Sidebar Section | Admin | Asset Manager | Dept Head | Employee |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Assets Catalog | ✅ | ✅ | ✅ | ✅ |
| Resource Bookings | ✅ | ✅ | ✅ | ✅ |
| Maintenance | ✅ | ✅ | ✅ | ✅ |
| Allocations | ✅ | ✅ | ❌ | ❌ |
| Transfers | ✅ | ✅ | ❌ | ❌ |
| Audits | ✅ | ✅ | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ❌ | ❌ |
| Departments Setup | ✅ | ❌ | ❌ | ❌ |
| Categories Setup | ✅ | ❌ | ❌ | ❌ |
| Employee Directory | ✅ | ❌ | ❌ | ❌ |
| System Logs | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## Key Features

### Authentication
- JWT-based login with access + refresh token flow
- Axios request interceptor automatically attaches Bearer token
- AuthContext provides global `user`, `login()`, `logout()` state
- Protected routes redirect to `/login` if unauthenticated

### Dashboard
- Real-time KPI stats: Available, Allocated, In Maintenance, Overdue, Active Bookings, Pending Transfers
- SVG circular progress rings for asset utilization rate and maintenance resolution rate
- Live overdue allocations alert list with days-overdue counter
- Recent system activity feed

### Asset Management
- Searchable and filterable asset directory (by category, status, department)
- Full asset detail with allocation history, custom fields, QR-ready asset tag display
- Allocation conflict detection — warns when an asset is already allocated and offers "Open Transfer Request Instead" redirect

### Bookings
- Time-slot booking with backend overlap conflict detection
- Calendar grouped by date with status indicators (upcoming / ongoing / completed)

### Audits
- Audit cycle creation with automatic asset scoping by department
- Per-asset verification with condition states: `good`, `damaged`, `missing`
- KPI metrics: Verified / Missing / Damaged / Remaining counts
- Close cycle button processes discrepancies and updates asset states

### Reports & Analytics
- **Utilization by Department** — grouped SVG bar chart (Allocated / Available / In Repair per dept)
- **Maintenance Frequency by Asset** — vertical SVG bar chart
- **Repair Frequency by Category** — horizontal SVG bar chart
- Retirement & warranty expiry tracker
- Overdue returns tracker
- One-click JSON export for Assets, Allocations, Maintenance, and Bookings

### Employee Management (Admin)
- Register employees linked to existing user accounts
- Promote employees to Department Head or Asset Manager (syncs role on User + Department head field)
- Transfer employees between departments
- Activate / deactivate employee status

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `http://localhost:3000` |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint linter on all JS/JSX files |

---

## Demo Credentials

These accounts are seeded by `assetflow-backend/src/seed.js`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@assetflow.com` | `adminpassword` |
| Asset Manager | `sarah@assetflow.com` | `password123` |
| Department Head | `raj@assetflow.com` | `password123` |
| Employee | `priya@assetflow.com` | `password123` |
| Employee | `anas@assetflow.com` | `password123` |

> Run the seed script first: `node src/seed.js` from the backend directory.

---

## API Integration

All API calls go through the Axios instance at `src/api/axios.js`.

- **Base URL**: proxied via Vite (`/api → http://localhost:5000/api`)
- **Auth**: Bearer token injected automatically via request interceptor
- **Errors**: Response interceptor handles 401 (token expiry) and redirects to login

---

## Related

- **Backend API** → [`../assetflow-backend/README.md`](../assetflow-backend/README.md)
