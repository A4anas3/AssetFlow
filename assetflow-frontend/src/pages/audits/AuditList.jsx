import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AuditList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ['admin', 'asset_manager'].includes(user?.role);

  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAudits();
  }, [statusFilter]);

  const fetchAudits = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/audits?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get(url);
      setAudits(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch audit cycles directory.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planned':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Planned</span>;
      case 'in_progress':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse">In Progress</span>;
      case 'closed':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Closed</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Physical Audits</h2>
          <p className="text-slate-500 text-sm mt-0.5">Plan and execute verification cycles to validate asset conditions and existence.</p>
        </div>
        {isPrivileged && (
          <button
            onClick={() => navigate('/audits/create')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Schedule Cycle
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shadow-slate-100/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!statusFilter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Cycles
            </button>
            <button
              onClick={() => setStatusFilter('planned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'planned' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Planned
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'in_progress' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'closed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Listing */}
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
      ) : audits.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="font-semibold text-sm">No audit cycles scheduled</p>
          {isPrivileged && (
            <button
              onClick={() => navigate('/audits/create')}
              className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
            >
              Plan your first audit verification cycle
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Audit Title</th>
                  <th className="px-6 py-4">Target Department</th>
                  <th className="px-6 py-4">Location Scope</th>
                  <th className="px-6 py-4">Assigned Auditors</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {audits.map((audit) => (
                  <tr key={audit._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-805">{audit.title}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{audit.department?.name || 'All'}</td>
                    <td className="px-6 py-4 text-slate-550">{audit.location || 'All Areas'}</td>
                    <td className="px-6 py-4">
                      {audit.auditors && audit.auditors.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {audit.auditors.map((aud, aIdx) => (
                            <span key={aIdx} className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {aud.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(audit.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/audits/${audit._id}`}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs inline-block"
                      >
                        Enter Portal
                      </Link>
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

export default AuditList;
