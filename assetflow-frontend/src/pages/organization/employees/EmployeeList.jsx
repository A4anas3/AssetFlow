import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { OrgSetupTabs } from '../departments/DepartmentList';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Dialog / Edit states
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newRole, setNewRole] = useState('employee');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDept, setNewDept] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employee directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments?limit=100');
      setDepartments(response.data.data.data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/employees/${id}/status`, { status: nextStatus });
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setActionLoading(true);
    try {
      await api.patch(`/employees/${selectedEmp._id}/promote`, {
        role: newRole,
        designation: newDesignation
      });
      setShowPromoteModal(false);
      setSelectedEmp(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update role/promotion.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setActionLoading(true);
    try {
      await api.patch(`/employees/${selectedEmp._id}/department`, {
        department: newDept
      });
      setShowDeptModal(false);
      setSelectedEmp(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to transfer department.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record? This cannot be undone.')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'asset_manager': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'department_head': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'asset_manager': return 'Asset Manager';
      case 'department_head': return 'Dept Head';
      default: return 'Employee';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Organization Setup</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage the hierarchy, employee structure, and asset metadata.</p>
        </div>
        <button
          onClick={() => navigate('/organization/employees/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Employee
        </button>
      </div>

      <OrgSetupTabs activeTab="employees" />

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white border border-slate-200/60 rounded-b-2xl shadow-sm shadow-slate-100/10">
          <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-b-2xl">
          <p className="font-semibold">{error}</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-b-2xl p-12 text-center text-slate-400">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="font-semibold text-sm">No employees registered yet</p>
          <button
            onClick={() => navigate('/organization/employees/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Register your first employee
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-b-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-500">{emp.employeeId}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{emp.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-500">{emp.user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {emp.department?.name || <span className="text-slate-400 text-xs italic">None</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{emp.designation}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleBadgeColor(emp.role)}`}>
                        {getRoleLabel(emp.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : emp.status === 'on_leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setSelectedEmp(emp);
                            setNewRole(emp.role);
                            setNewDesignation(emp.designation);
                            setShowPromoteModal(true);
                          }}
                          className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                          title="Promote / Assign Role"
                        >
                          Promote
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmp(emp);
                            setNewDept(emp.department?._id || '');
                            setShowDeptModal(true);
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                          title="Transfer Department"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp._id, emp.status)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Employee Record"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROMOTION / ROLE MODAL */}
      {showPromoteModal && selectedEmp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Promote Employee</h3>
            <p className="text-slate-500 text-xs mt-0.5">Assign Designation and System Role for {selectedEmp.user?.name}.</p>
            <form onSubmit={handlePromoteSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Designation</label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                >
                  <option value="employee">Employee</option>
                  <option value="department_head">Department Head</option>
                  <option value="asset_manager">Asset Manager</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSelectedEmp(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Apply Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPARTMENT TRANSFER MODAL */}
      {showDeptModal && selectedEmp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Transfer Employee</h3>
            <p className="text-slate-500 text-xs mt-0.5">Move {selectedEmp.user?.name} to another department.</p>
            <form onSubmit={handleDeptSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeptModal(false);
                    setSelectedEmp(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeList;
