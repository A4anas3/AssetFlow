import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const EmployeeCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments?limit=100');
      setDepartments(response.data.data.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !employeeId || !designation || !department) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create the User via signup (does not overwrite admin local storage if we extract it)
      // Note: we call auth/signup.
      const signupRes = await api.post('/auth/signup', {
        name,
        email,
        password
      });

      const newUser = signupRes.data.data.user;
      const userId = newUser._id;

      // 2. Create the Employee record
      await api.post('/employees', {
        employeeId,
        user: userId,
        department,
        designation,
        phone
      });

      navigate('/organization/employees');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register employee.');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
          <p className="text-slate-500 text-sm mt-0.5">Register a new employee record and linked credentials.</p>
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
        <div className="bg-teal-50/50 p-4 border border-teal-100/50 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-teal-800 flex items-center gap-1.5">
            <svg className="h-4.5 w-4.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            User Account Login Credentials
          </h3>
          <p className="text-xs text-slate-500">A user login record will be automatically generated with default Employee role permissions.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                placeholder="john@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                placeholder="Min 6 characters"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Employment Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee ID *</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                placeholder="e.g. EMP-0010"
                required
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeCreate;
