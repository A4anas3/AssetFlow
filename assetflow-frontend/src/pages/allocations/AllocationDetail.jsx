import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AllocationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ['admin', 'asset_manager'].includes(user?.role);

  const [alloc, setAlloc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Return Dialog States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnCondition, setReturnCondition] = useState('good');
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    fetchAllocation();
  }, [id]);

  const fetchAllocation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/allocations/${id}`);
      setAlloc(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load allocation detail.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAllocation = async () => {
    if (!window.confirm('Are you sure you want to cancel this allocation? The asset will return to available status.')) return;
    setActionLoading(true);
    try {
      await api.patch(`/allocations/${id}/cancel`);
      fetchAllocation();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel allocation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // 1. Submit return request condition logs
      await api.patch(`/allocations/${id}/return`, {
        checkInNotes: returnNotes,
        checkInCondition: returnCondition
      });

      // 2. Proactively approve return since this view is for Admin/Asset Manager
      if (isPrivileged) {
        await api.patch(`/allocations/${id}/approve-return`, {
          checkInNotes: returnNotes,
          checkInCondition: returnCondition
        });
      }

      setShowReturnModal(false);
      fetchAllocation();
      alert('Return completed successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to check-in return.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveReturn = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/allocations/${id}/approve-return`, {
        checkInNotes: alloc.returnNotes || 'Completed',
        checkInCondition: alloc.conditionOnReturn || 'good'
      });
      fetchAllocation();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve return.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !alloc) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl max-w-2xl mx-auto mt-10">
        <p className="font-bold">Error</p>
        <p className="text-sm mt-1">{error || 'Allocation record not found'}</p>
        <Link to="/allocations" className="mt-4 inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Back to list
        </Link>
      </div>
    );
  }

  const isOverdue = alloc.status === 'active' && alloc.expectedReturnDate && new Date(alloc.expectedReturnDate) < new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/allocations')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Allocation Record</h2>
          <p className="text-slate-500 text-sm mt-0.5">View details, expected return dates, and approve check-ins.</p>
        </div>
      </div>

      {isOverdue && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-3 shadow-xs">
          <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold">This assignment is overdue. Returns must be processed immediately.</span>
        </div>
      )}

      {/* Detail Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-6">
        
        {/* Status Indicators */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignment Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                alloc.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : alloc.status === 'return_requested'
                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {alloc.status}
              </span>
              {isOverdue && <span className="text-xs font-bold text-rose-600">OVERDUE</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Allocated By</span>
            <span className="text-sm font-semibold text-slate-700 mt-1 block">{alloc.allocatedBy?.name || 'System'}</span>
          </div>
        </div>

        {/* Asset details link */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asset Item</span>
            <span className="text-base font-extrabold text-slate-800 mt-0.5 block">{alloc.asset?.name}</span>
            <span className="text-xs font-bold text-slate-500 uppercase mt-0.5 block">Tag: {alloc.asset?.assetTag}</span>
          </div>
          <Link
            to={`/assets/${alloc.asset?._id || alloc.asset}`}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            View Asset Catalog
          </Link>
        </div>

        {/* Assignee Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee Name</span>
            <span className="text-sm font-bold text-slate-700 mt-0.5 block">{alloc.employee?.user?.name}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee Designation</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{alloc.employee?.designation}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Check Out Date</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{new Date(alloc.allocatedAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Return Date</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
              {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString() : 'No Limit'}
            </span>
          </div>
        </div>

        {/* Returned Info */}
        {alloc.status === 'returned' && (
          <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/50">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Returned At</span>
              <span className="text-sm font-bold text-slate-700 mt-0.5 block">{new Date(alloc.returnedAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Condition On Return</span>
              <span className="text-sm font-bold text-teal-600 mt-0.5 block capitalize">{alloc.conditionOnReturn}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Check-in Notes</span>
              <p className="text-xs text-slate-600 italic mt-0.5">{alloc.returnNotes || 'No notes left.'}</p>
            </div>
          </div>
        )}

        {/* Action Controls for Admin/Manager */}
        {isPrivileged && (
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            {alloc.status === 'active' && (
              <>
                <button
                  type="button"
                  onClick={handleCancelAllocation}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel Allocation
                </button>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  Process Check-in Return
                </button>
              </>
            )}

            {alloc.status === 'return_requested' && (
              <button
                type="button"
                onClick={handleApproveReturn}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
              >
                Approve Return & Check-In
              </button>
            )}
          </div>
        )}
      </div>

      {/* RETURN MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Return Asset Check-in</h3>
            <p className="text-slate-500 text-xs mt-0.5">Please check and log the return conditions and check-in details.</p>
            <form onSubmit={handleReturnSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Check-in condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged / Needs Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Check-in Notes</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  placeholder="Describe physical condition, missing accessories..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnNotes('');
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
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllocationDetail;
