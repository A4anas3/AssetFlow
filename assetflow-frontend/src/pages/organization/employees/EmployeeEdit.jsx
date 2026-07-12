import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/axios';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployeeAndMetadata();
  }, [id]);

  const fetchEmployeeAndMetadata = async () => {
    setFetchLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments?limit=100'),
        api.get(`/employees/${id}`)
      ]);

      setDepartments(deptRes.data.data.data || []);

      const emp = empRes.data.data;
      setEmployeeId(emp.employeeId);
      setDesignation(emp.designation);
      setDepartment(emp.department?._id || emp.department || '');
      setPhone(emp.phone || '');
      setName(emp.user?.name || '');
      setEmail(emp.user?.email || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load employee details.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!designation || !department) {
      setError('Designation and Department are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.put(`/employees/${id}`, {
        designation,
        department,
        phone
      });
      navigate('/organization/employees');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update employee.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/organization/employees')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Edit Employee Details</h2>
          <p className="text-slate-500 text-sm mt-0.5">Modify designation, department, and contact details for {name}.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-5">
        
        {/* User read-only credentials */}
        <div className="bg-slate-50 p-4 border border-slate-200/50 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</span>
            <span className="text-sm font-bold text-slate-700 mt-1 block">{employeeId}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Name</span>
            <span className="text-sm font-semibold text-slate-700 mt-1 block">{name}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Email</span>
            <span className="text-sm font-semibold text-slate-700 mt-1 block truncate">{email}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Designation *</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              placeholder="e.g. +1 555-0199"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/organization/employees')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeEdit;
