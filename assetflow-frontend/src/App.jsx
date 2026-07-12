import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import Dashboard from './pages/dashboard/Dashboard';

import DepartmentList from './pages/organization/departments/DepartmentList';
import DepartmentCreate from './pages/organization/departments/DepartmentCreate';
import DepartmentEdit from './pages/organization/departments/DepartmentEdit';

import CategoryList from './pages/organization/categories/CategoryList';
import CategoryCreate from './pages/organization/categories/CategoryCreate';
import CategoryEdit from './pages/organization/categories/CategoryEdit';

import EmployeeList from './pages/organization/employees/EmployeeList';
import EmployeeDetail from './pages/organization/employees/EmployeeDetail';
import EmployeeEdit from './pages/organization/employees/EmployeeEdit';
import EmployeeCreate from './pages/organization/employees/EmployeeCreate';

import AssetList from './pages/assets/AssetList';
import AssetCreate from './pages/assets/AssetCreate';
import AssetDetail from './pages/assets/AssetDetail';
import AssetEdit from './pages/assets/AssetEdit';

import AllocationList from './pages/allocations/AllocationList';
import AllocationCreate from './pages/allocations/AllocationCreate';
import AllocationDetail from './pages/allocations/AllocationDetail';

import TransferList from './pages/transfers/TransferList';
import TransferCreate from './pages/transfers/TransferCreate';
import TransferDetail from './pages/transfers/TransferDetail';

import BookingList from './pages/bookings/BookingList';
import BookingCalendar from './pages/bookings/BookingCalendar';
import BookingCreate from './pages/bookings/BookingCreate';
import BookingDetail from './pages/bookings/BookingDetail';

import MaintenanceList from './pages/maintenance/MaintenanceList';
import MaintenanceCreate from './pages/maintenance/MaintenanceCreate';
import MaintenanceDetail from './pages/maintenance/MaintenanceDetail';

import AuditList from './pages/audits/AuditList';
import AuditCreate from './pages/audits/AuditCreate';
import AuditDetail from './pages/audits/AuditDetail';

import Reports from './pages/reports/Reports';
import Notifications from './pages/notifications/Notifications';
import ActivityLogs from './pages/activity-logs/ActivityLogs';

import Profile from './pages/profile/Profile';
import ProfileEdit from './pages/profile/ProfileEdit';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';

const ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.ADMIN]}
                  />
                }
              >
                <Route path="/organization/departments" element={<DepartmentList />} />
                <Route path="/organization/departments/create" element={<DepartmentCreate />} />
                <Route path="/organization/departments/:id/edit" element={<DepartmentEdit />} />

                <Route path="/organization/categories" element={<CategoryList />} />
                <Route path="/organization/categories/create" element={<CategoryCreate />} />
                <Route path="/organization/categories/:id/edit" element={<CategoryEdit />} />

                <Route path="/organization/employees" element={<EmployeeList />} />
                <Route path="/organization/employees/create" element={<EmployeeCreate />} />
                <Route path="/organization/employees/:id" element={<EmployeeDetail />} />
                <Route path="/organization/employees/:id/edit" element={<EmployeeEdit />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]}
                  />
                }
              >
                <Route path="/assets" element={<AssetList />} />
                <Route path="/assets/:id" element={<AssetDetail />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}
                  />
                }
              >
                <Route path="/assets/create" element={<AssetCreate />} />
                <Route path="/assets/:id/edit" element={<AssetEdit />} />

                <Route path="/allocations" element={<AllocationList />} />
                <Route path="/allocations/create" element={<AllocationCreate />} />
                <Route path="/allocations/:id" element={<AllocationDetail />} />

                <Route path="/transfers" element={<TransferList />} />
                <Route path="/transfers/create" element={<TransferCreate />} />
                <Route path="/transfers/:id" element={<TransferDetail />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]}
                  />
                }
              >
                <Route path="/bookings" element={<BookingList />} />
                <Route path="/bookings/calendar" element={<BookingCalendar />} />
                <Route path="/bookings/create" element={<BookingCreate />} />
                <Route path="/bookings/:id" element={<BookingDetail />} />

                <Route path="/maintenance" element={<MaintenanceList />} />
                <Route path="/maintenance/create" element={<MaintenanceCreate />} />
                <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}
                  />
                }
              >
                <Route path="/audits" element={<AuditList />} />
                <Route path="/audits/create" element={<AuditCreate />} />
                <Route path="/audits/:id" element={<AuditDetail />} />

                <Route path="/reports" element={<Reports />} />

                <Route path="/activity-logs" element={<ActivityLogs />} />
              </Route>

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />

              <Route
                element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}
              >
                <Route path="/settings" element={<Settings />} />
              </Route>

            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
