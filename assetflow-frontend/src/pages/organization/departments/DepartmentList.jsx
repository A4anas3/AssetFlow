import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

export const OrgSetupTabs = ({ activeTab }) => {
  return (
    <div className="flex border-b border-slate-200 mb-6 bg-white px-4 pt-2 rounded-t-2xl border-t border-x border-slate-200/60 shadow-sm shadow-slate-100/10">
      <Link
        to="/organization/departments"
        className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 ${
          activeTab === 'departments'
            ? 'border-teal-600 text-teal-600 font-extrabold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Departments Setup
      </Link>
      <Link
        to="/organization/categories"
        className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 ${
          activeTab === 'categories'
            ? 'border-teal-600 text-teal-600 font-extrabold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Asset Categories
      </Link>
      <Link
        to="/organization/employees"
        className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 ${
          activeTab === 'employees'
            ? 'border-teal-600 text-teal-600 font-extrabold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Employee Directory & Roles
      </Link>
    </div>
  );
};

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/departments?limit=100');
      setDepartments(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/departments/${id}/status`, { status: newStatus });
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update department status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This cannot be undone.')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete department.');
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
          onClick={() => navigate('/organization/departments/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Department
        </button>
      </div>

      <OrgSetupTabs activeTab="departments" />

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
      ) : departments.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-b-2xl p-12 text-center text-slate-400">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-semibold text-sm">No departments registered yet</p>
          <button
            onClick={() => navigate('/organization/departments/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Create your first department
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-b-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Parent Dept</th>
                  <th className="px-6 py-4">Dept Head</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{dept.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{dept.name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {dept.parentDepartment?.name || dept.parentDepartment?.code || 'None'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {dept.head?.name || <span className="text-slate-400 text-xs italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        dept.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {dept.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleStatus(dept._id, dept.status)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                        >
                          {dept.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => navigate(`/organization/departments/${dept._id}/edit`)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
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
    </div>
  );
};

export default DepartmentList;
