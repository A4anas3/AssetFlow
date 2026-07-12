import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/activity-logs?limit=100';
      if (moduleFilter) url += `&module=${moduleFilter}`;
      const response = await api.get(url);
      setLogs(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch activity logs database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Activity Logs</h2>
          <p className="text-slate-500 text-sm mt-0.5">Audit trail of administrative actions, creations, state changes, and deletes.</p>
        </div>

        {/* Filter */}
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:border-teal-500 shadow-sm"
        >
          <option value="">All Modules</option>
          <option value="auth">Authentication</option>
          <option value="asset">Assets</option>
          <option value="allocation">Allocations</option>
          <option value="transfer">Transfers</option>
          <option value="booking">Bookings</option>
          <option value="maintenance">Maintenance</option>
          <option value="audit">Audits</option>
          <option value="department">Departments</option>
          <option value="category">Categories</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10">
          <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl">
          <p className="font-semibold">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-sm">No activity logs recorded yet</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Administrative Role</th>
                  <th className="px-6 py-4">Administrative Action</th>
                  <th className="px-6 py-4">Module Layer</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-805">
                      <div className="space-y-0.5">
                        <span className="block font-bold text-slate-800">{log.actor?.name || 'System Admin'}</span>
                        <span className="block text-xs font-medium text-slate-400">{log.actor?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border border-slate-205 uppercase tracking-wide bg-slate-50 text-slate-700">
                        {log.actor?.role || 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{log.action}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border border-teal-100 text-teal-700 bg-teal-50 uppercase">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
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

export default ActivityLogs;
