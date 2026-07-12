import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AuditCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [locationScope, setLocationScope] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get('/departments?limit=100');
      setDepartments(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !department) {
      setError('Title and Department are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/audits', {
        title,
        department,
        location: locationScope,
        scheduledDate,
        startDate: scheduledDate
      });
      navigate('/audits');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to schedule audit cycle.');
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
          onClick={() => navigate('/audits')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Schedule Audit Cycle</h2>
          <p className="text-slate-500 text-sm mt-0.5">Define department and location scopes for asset reconciliation.</p>
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
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Cycle Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            placeholder="e.g. Q3 Hardware Inventory check"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Department *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location Scope (Room/Floor)</label>
            <input
              type="text"
              value={locationScope}
              onChange={(e) => setLocationScope(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              placeholder="e.g. Level 3, Lobby (optional)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Start Date *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-xs text-slate-500 space-y-1 leading-relaxed">
          <p className="font-bold text-slate-700">Audit Reconciliation Mechanics:</p>
          <p>• The system will automatically index and include all assets assigned to the target department.</p>
          <p>• Auditors can mark items as Verified, Missing, or Damaged in real-time.</p>
          <p>• Closing the cycle will lock the records and automatically mark confirmed-missing items as LOST and flag damaged items.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/audits')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {loading ? 'Scheduling...' : 'Schedule Cycle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuditCreate;
