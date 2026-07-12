import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const TransferList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Reject reason dialog
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Department Head or Admin role check
  const isApprover = ['admin', 'department_head', 'asset_manager'].includes(user?.role);

  useEffect(() => {
    fetchTransfers();
  }, [statusFilter]);

  const fetchTransfers = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/transfers?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get(url);
      setTransfers(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load transfer requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this asset transfer?')) return;
    setActionLoading(true);
    try {
      await api.patch(`/transfers/${id}/approve`);
      fetchTransfers();
      alert('Transfer request approved.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransfer || !rejectReason) return;
    setActionLoading(true);
    try {
      await api.patch(`/transfers/${selectedTransfer._id}/reject`, {
        rejectionReason: rejectReason
      });
      setShowRejectModal(false);
      setSelectedTransfer(null);
      setRejectReason('');
      fetchTransfers();
      alert('Transfer request rejected.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this transfer request?')) return;
    setActionLoading(true);
    try {
      await api.patch(`/transfers/${id}/cancel`);
      fetchTransfers();
      alert('Transfer request cancelled.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Pending Approval</span>;
      case 'approved':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Approved</span>;
      case 'rejected':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">Rejected</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-105 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Transfer Requests</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage and authorize inter-department asset movements.</p>
        </div>
        <button
          onClick={() => navigate('/transfers/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Request Transfer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shadow-slate-100/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!statusFilter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Requests
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'approved' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'rejected' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Rejected
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
      ) : transfers.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
          </svg>
          <p className="font-semibold text-sm">No transfer requests logged</p>
          <button
            onClick={() => navigate('/transfers/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Create your first transfer request
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">From Department</th>
                  <th className="px-6 py-4">To Department</th>
                  <th className="px-6 py-4">Requested By</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transfers.map((trans) => (
                  <tr key={trans._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="space-y-0.5">
                        <span className="block font-black text-slate-800 uppercase tracking-tight">{trans.asset?.assetTag}</span>
                        <span className="block text-xs font-medium text-slate-550">{trans.asset?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{trans.fromDepartment?.name || 'Pool'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{trans.toDepartment?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{trans.requestedBy?.name || 'System'}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={trans.reason}>{trans.reason || 'None'}</td>
                    <td className="px-6 py-4">{getStatusBadge(trans.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <Link
                          to={`/transfers/${trans._id}`}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          View
                        </Link>
                        {trans.status === 'pending' && (
                          <>
                            {isApprover && (
                              <>
                                <button
                                  onClick={() => handleApprove(trans._id)}
                                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTransfer(trans);
                                    setShowRejectModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-250 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {trans.requestedBy?._id === user?._id && (
                              <button
                                onClick={() => handleCancel(trans._id)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {showRejectModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Reject Transfer Request</h3>
            <p className="text-slate-500 text-xs mt-0.5">Please provide a reason for rejecting this inter-department transfer request.</p>
            <form onSubmit={handleRejectSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  placeholder="Specify why the transfer cannot be approved..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTransfer(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/10 cursor-pointer"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransferList;
