import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AllocationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllocations();
  }, [statusFilter]);

  const fetchAllocations = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/allocations?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const response = await api.get(url);
      setAllocations(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load allocations catalog.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, expectedReturnDate) => {
    const now = new Date();
    const isOverdue = status === 'active' && expectedReturnDate && new Date(expectedReturnDate) < now;

    if (isOverdue) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
          Overdue
        </span>
      );
    }

    switch (status) {
      case 'active':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>;
      case 'return_requested':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Return Requested</span>;
      case 'returned':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-650 border border-slate-200">Returned</span>;
      case 'transferred':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">Transferred</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Asset Allocations</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track and manage asset assignments to employees or departments.</p>
        </div>
        <button
          onClick={() => navigate('/allocations/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Allocate Asset
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shadow-slate-100/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Status:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!statusFilter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Allocations
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('return_requested')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'return_requested' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Requests
            </button>
            <button
              onClick={() => setStatusFilter('returned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'returned' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Returned
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
      ) : allocations.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
          </svg>
          <p className="font-semibold text-sm">No allocations matching filter found</p>
          <button
            onClick={() => navigate('/allocations/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Create an allocation assignment
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Asset Tag</th>
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Allocation Date</th>
                  <th className="px-6 py-4">Expected Return</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {allocations.map((alloc) => (
                  <tr key={alloc._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">
                      <Link to={`/assets/${alloc.asset?._id}`} className="hover:text-teal-600 transition-colors underline">
                        {alloc.asset?.assetTag}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{alloc.asset?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{alloc.employee?.user?.name || 'N/A'}</span>
                        <span className="text-xs text-slate-400 block">{alloc.employee?.designation || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(alloc.allocatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'No Limit'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(alloc.status, alloc.expectedReturnDate)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/allocations/${alloc._id}`}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs inline-block"
                      >
                        Manage
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

export default AllocationList;
