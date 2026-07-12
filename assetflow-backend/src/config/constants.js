const ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
};

// Full lifecycle per spec: Available → Allocated / Reserved → In Maintenance → Retired / Lost / Disposed
const ASSET_STATUS = {
  AVAILABLE: 'available',
  ALLOCATED: 'allocated',
  RESERVED: 'reserved',
  IN_MAINTENANCE: 'in_maintenance',
  RETIRED: 'retired',
  LOST: 'lost',
  DISPOSED: 'disposed',
};

const ALLOCATION_STATUS = {
  ACTIVE: 'active',
  RETURN_REQUESTED: 'return_requested',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
  TRANSFERRED: 'transferred',
};

const TRANSFER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Spec: Upcoming, Ongoing, Completed, Cancelled
const BOOKING_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

const MAINTENANCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

const AUDIT_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
};

const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
};

module.exports = {
  ROLES,
  ASSET_STATUS,
  ALLOCATION_STATUS,
  TRANSFER_STATUS,
  BOOKING_STATUS,
  MAINTENANCE_STATUS,
  AUDIT_STATUS,
  DEPARTMENT_STATUS,
  EMPLOYEE_STATUS,
};
