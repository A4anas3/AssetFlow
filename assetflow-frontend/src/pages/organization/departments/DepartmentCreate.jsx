import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const DepartmentCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [parentDepartment, setParentDepartment] = useState('');
  const [head, setHead] = useState('');
  const [status, setStatus] = useState('active');

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        api.get('/departments?limit=100'),
        api.get('/employees?limit=100')
      ]);
      setDepartments(deptRes.data.data.data || []);
      setEmployees(empRes.data.data.data || []);
    } catch (err) {
      console.error('Failed to fetch department/employee metadata:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      setError('Name and Code are required.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      code,
      description,
      location,
      parentDepartment: parentDepartment || null,
      head: head || null,
      status
    };

    try {
      await api.post('/departments', payload);
      navigate('/organization/departments');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/organization/departments')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add New Department</h2>
          <p className="text-slate-500 text-sm mt-0.5">Register a new department in the corporate hierarchy.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              placeholder="e.g. Information Technology"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Code *</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-bold uppercase"
              placeholder="e.g. IT"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            placeholder="Describe the department responsibilities..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              placeholder="e.g. Floor 3, Block B"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 pt-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parent Department (Hierarchy)</label>
            <select
              value={parentDepartment}
              onChange={(e) => setParentDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="">None (Top Level)</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department Head</label>
            <select
              value={head}
              onChange={(e) => setHead(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="">None Assigned</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.user?._id}>{emp.user?.name} ({emp.designation})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/organization/departments')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentCreate;
