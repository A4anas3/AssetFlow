

## Role-Based Access

| Role | Description |
|---|---|
| `admin` | Full access to all modules |
| `asset_manager` | Assets, Allocations, Transfers, Maintenance, Reports |
| `department_head` | Department assets, Transfer approvals, Bookings |
| `employee` | My assets, Bookings, Maintenance requests, Notifications, Profile |

All protected routes require a `Bearer <token>` header.

---

## API Routes

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Login and receive access + refresh tokens |
| `POST` | `/api/auth/logout` | Auth | Invalidate session and clear refresh token |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset email with token link |
| `POST` | `/api/auth/reset-password` | Public | Reset password using the token from email |
| `GET` | `/api/auth/me` | Auth | Get the currently authenticated user's profile |
| `POST` | `/api/auth/refresh-token` | Public | Issue new access token using refresh token |

---

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Auth | Total assets, allocated, in-maintenance, available counts |
| `GET` | `/api/dashboard/recent-activities` | Auth | Last 10 activity log entries across all modules |
| `GET` | `/api/dashboard/notifications` | Auth | Unread notifications for the current user |
| `GET` | `/api/dashboard/kpis` | Auth | Utilization rate, maintenance resolution rate |

---

### Departments — `/api/departments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/departments` | Auth | List all departments (paginated) |
| `GET` | `/api/departments/:id` | Auth | Get a single department by ID |
| `POST` | `/api/departments` | Admin | Create a new department |
| `PUT` | `/api/departments/:id` | Admin | Update department details |
| `DELETE` | `/api/departments/:id` | Admin | Delete a department |
| `PATCH` | `/api/departments/:id/status` | Admin | Toggle department active/inactive status |

---

### Asset Categories — `/api/categories`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Auth | List all categories with optional parent reference |
| `GET` | `/api/categories/:id` | Auth | Get a single category by ID |
| `POST` | `/api/categories` | Admin, Asset Manager | Create a new asset category |
| `PUT` | `/api/categories/:id` | Admin, Asset Manager | Update category name, description, depreciation rate |
| `DELETE` | `/api/categories/:id` | Admin | Delete a category |

---

### Employees — `/api/employees`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/employees` | Auth | List all employees (filter by department, status) |
| `GET` | `/api/employees/:id` | Auth | Get employee details with linked user and department |
| `POST` | `/api/employees` | Admin | Create employee record linked to a User account |
| `PUT` | `/api/employees/:id` | Admin | Update employee designation, phone, etc. |
| `DELETE` | `/api/employees/:id` | Admin | Delete employee record |
| `PATCH` | `/api/employees/:id/promote` | Admin | Update designation and role simultaneously |
| `PATCH` | `/api/employees/:id/status` | Admin | Set employee status (active / inactive / on_leave) |
| `PATCH` | `/api/employees/:id/department` | Admin | Transfer employee to a different department |
| `PATCH` | `/api/employees/:id/role` | Admin | Change employee system role |

---

### Assets — `/api/assets`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/assets` | Auth | List all assets (filter by status, category, department) |
| `GET` | `/api/assets/:id` | Auth | Get full asset detail including category and department |
| `POST` | `/api/assets` | Admin, Asset Manager | Register a new asset |
| `PUT` | `/api/assets/:id` | Admin, Asset Manager | Update asset details |
| `DELETE` | `/api/assets/:id` | Admin | Delete an asset record |
| `GET` | `/api/assets/search?q=` | Auth | Full-text search by name, assetTag, serialNumber |
| `GET` | `/api/assets/history/:id` | Auth | Get full allocation history for an asset |
| `GET` | `/api/assets/qr/:assetTag` | Auth | Lookup asset by assetTag (used for QR scan) |

---

### Asset Allocation — `/api/allocations`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/allocations` | Auth | List all allocations (filter by status) |
| `GET` | `/api/allocations/:id` | Auth | Get allocation detail with asset and employee info |
| `POST` | `/api/allocations` | Admin, Asset Manager | Allocate an available asset to an employee |
| `PATCH` | `/api/allocations/:id/return` | Auth | Employee requests return of allocated asset |
| `PATCH` | `/api/allocations/:id/approve-return` | Admin, Asset Manager | Approve return and mark asset as available again |
| `PATCH` | `/api/allocations/:id/cancel` | Admin, Asset Manager | Cancel an active allocation |

---

### Transfer Requests — `/api/transfers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/transfers` | Auth | List all transfer requests (filter by status) |
| `GET` | `/api/transfers/:id` | Auth | Get transfer detail with from/to departments |
| `POST` | `/api/transfers` | Auth | Create a new inter-department transfer request |
| `PATCH` | `/api/transfers/:id/approve` | Admin, Dept Head | Approve transfer and update asset's department |
| `PATCH` | `/api/transfers/:id/reject` | Admin, Dept Head | Reject transfer with an optional reason |
| `PATCH` | `/api/transfers/:id/cancel` | Auth | Cancel a pending transfer request |

---

### Resource Booking — `/api/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Auth | List all bookings (filter by status) |
| `GET` | `/api/bookings/:id` | Auth | Get booking detail |
| `POST` | `/api/bookings` | Auth | Create a booking with conflict detection |
| `PUT` | `/api/bookings/:id` | Auth | Update booking details |
| `DELETE` | `/api/bookings/:id` | Admin | Delete a booking record |
| `PATCH` | `/api/bookings/:id/cancel` | Auth | Cancel a confirmed booking |
| `PATCH` | `/api/bookings/:id/reschedule` | Auth | Reschedule with new start/end times (conflict checked) |
| `GET` | `/api/bookings/calendar` | Auth | Fetch confirmed bookings for a date range |
| `GET` | `/api/bookings/resource/:id` | Auth | Fetch all bookings for a specific resource/asset |

---

### Maintenance — `/api/maintenance`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Auth | List all maintenance requests (filter by status, priority) |
| `GET` | `/api/maintenance/:id` | Auth | Get full maintenance request detail |
| `POST` | `/api/maintenance` | Auth | Submit a new maintenance request for an asset |
| `PATCH` | `/api/maintenance/:id/approve` | Admin, Asset Manager | Approve request and mark asset as in_maintenance |
| `PATCH` | `/api/maintenance/:id/reject` | Admin, Asset Manager | Reject request with an optional reason |
| `PATCH` | `/api/maintenance/:id/assign` | Admin, Asset Manager | Assign a technician to the request |
| `PATCH` | `/api/maintenance/:id/start` | Auth | Mark maintenance as in-progress |
| `PATCH` | `/api/maintenance/:id/resolve` | Auth | Resolve request, log actual cost, mark asset available |

---

### Asset Audit — `/api/audits`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/audits` | Auth | List all audits (filter by status) |
| `GET` | `/api/audits/:id` | Auth | Get audit detail with embedded asset verification list |
| `POST` | `/api/audits` | Admin, Asset Manager | Create audit — auto-populates assets from department |
| `PATCH` | `/api/audits/:id/assign-auditor` | Admin | Assign auditor and set status to in_progress |
| `PATCH` | `/api/audits/:id/verify-asset` | Auth | Mark a specific asset as verified with condition |
| `PATCH` | `/api/audits/:id/close` | Admin, Asset Manager | Close audit with a summary |
| `GET` | `/api/audits/:id/report` | Auth | Get audit report stats (verified, missing, damaged) |

---

### Reports — `/api/reports`

> Requires `admin` or `asset_manager` role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/utilization` | Asset utilization rate across all assets |
| `GET` | `/api/reports/maintenance` | Maintenance records grouped by status with total cost |
| `GET` | `/api/reports/department-summary` | Per-department asset totals and allocation counts |
| `GET` | `/api/reports/booking-heatmap` | Booking frequency grouped by date |
| `GET` | `/api/reports/retirement` | All retired assets with category and department |
| `GET` | `/api/reports/export?type=` | Export raw data (assets / allocations / maintenance) |

---

### Notifications — `/api/notifications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Auth | List all notifications for the current user |
| `PATCH` | `/api/notifications/:id/read` | Auth | Mark a single notification as read |
| `PATCH` | `/api/notifications/read-all` | Auth | Mark all notifications as read |
| `DELETE` | `/api/notifications/:id` | Auth | Delete a notification |

---

### Activity Logs — `/api/activity-logs`

> Admin only.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activity-logs` | List all activity logs (filter by module, actor) |
| `GET` | `/api/activity-logs/:id` | Get a single activity log entry |

---

### Profile — `/api/profile`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/profile` | Auth | Get current user's profile with department |
| `PUT` | `/api/profile` | Auth | Update name and email |
| `PATCH` | `/api/profile/password` | Auth | Change password (requires current password) |
| `PATCH` | `/api/profile/avatar` | Auth | Upload a new avatar image (multipart/form-data) |

---

### Settings — `/api/settings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/settings` | Auth | Get all settings as key-value object |
| `PUT` | `/api/settings` | Admin | Upsert one or multiple settings keys |

---

## Response Format

All endpoints return a consistent JSON structure:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success",
  "data": { }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Pagination

List endpoints support query parameters:

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `10` | Items per page |

Response includes a `pagination` object:

```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```
