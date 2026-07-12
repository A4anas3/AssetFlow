import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const MaintenanceList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/maintenance?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get(url);
      setTickets(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch maintenance tickets.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'medium': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Pending</span>;
      case 'approved':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Approved</span>;
      case 'in_progress':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 animate-pulse">In Progress</span>;
      case 'completed':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Completed</span>;
      case 'rejected':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">Rejected</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Maintenance Tickets</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track hardware repairs, technician dispatches, and cost logging.</p>
        </div>
        <button
          onClick={() => navigate('/maintenance/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Raise Ticket
        </button>
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
              All Tickets
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'in_progress' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'completed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Grid List */}
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
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-semibold text-sm">No maintenance tickets logged</p>
          <button
            onClick={() => navigate('/maintenance/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Create your first maintenance request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => navigate(`/maintenance/${ticket._id}`)}
              className="bg-white border border-slate-200/60 hover:border-slate-350 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-xs tracking-wide">
                  {ticket.asset?.assetTag}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadgeColor(ticket.priority)}`}>
                  {ticket.priority} priority
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-850 tracking-tight group-hover:text-teal-600 transition-colors">
                  {ticket.title}
                </h3>
                <p className="text-slate-400 text-xs truncate">{ticket.description || 'No description provided.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ticket Status</span>
                  <div className="mt-0.5">{getStatusBadge(ticket.status)}</div>
                </div>
                {ticket.actualCost > 0 && (
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Repair Cost</span>
                    <span className="font-black text-teal-600 block mt-0.5">${ticket.actualCost.toLocaleString()}</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
