const ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
};

const ASSET_STATUS = {
  AVAILABLE: 'available',
  ALLOCATED: 'allocated',
  IN_MAINTENANCE: 'in_maintenance',
  RETIRED: 'retired',
  LOST: 'lost',
};

const ALLOCATION_STATUS = {
  ACTIVE: 'active',
  RETURN_REQUESTED: 'return_requested',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
};

const TRANSFER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
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
