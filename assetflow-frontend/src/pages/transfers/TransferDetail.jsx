import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const TransferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Reject reason dialog
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Approver role check
  const isApprover = ['admin', 'department_head', 'asset_manager'].includes(user?.role);

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const fetchTransfer = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/transfers/${id}`);
      setTransfer(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load transfer request details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this transfer?')) return;
    setActionLoading(true);
    try {
      await api.patch(`/transfers/${id}/approve`);
      fetchTransfer();
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
    if (!rejectReason) return;
    setActionLoading(true);
    try {
      await api.patch(`/transfers/${id}/reject`, {
        rejectionReason: rejectReason
      });
      setShowRejectModal(false);
      setRejectReason('');
      fetchTransfer();
      alert('Transfer request rejected.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this transfer request?')) return;
    setActionLoading(true);
    try {
      await api.patch(`/transfers/${id}/cancel`);
      fetchTransfer();
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
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
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

  if (error || !transfer) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl max-w-2xl mx-auto mt-10">
        <p className="font-bold">Error</p>
        <p className="text-sm mt-1">{error || 'Transfer request not found'}</p>
        <Link to="/transfers" className="mt-4 inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/transfers')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Transfer Request Detail</h2>
          <p className="text-slate-500 text-sm mt-0.5">Authorizations, timestamps, and transfer records.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-6">
        
        {/* Status indicator */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Request Status</span>
            <div className="mt-1">{getStatusBadge(transfer.status)}</div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Raised</span>
            <span className="text-sm font-semibold text-slate-700 mt-1 block">{new Date(transfer.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Linked Asset */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asset Item</span>
            <span className="text-base font-extrabold text-slate-800 mt-0.5 block">{transfer.asset?.name}</span>
            <span className="text-xs font-bold text-slate-550 uppercase mt-0.5 block">Tag: {transfer.asset?.assetTag}</span>
          </div>
          <Link
            to={`/assets/${transfer.asset?._id || transfer.asset}`}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
          >
            Catalog Detail
          </Link>
        </div>

        {/* Transfer routing info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">From Department</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{transfer.fromDepartment?.name || 'Pool'}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">To Department</span>
            <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{transfer.toDepartment?.name}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requested By (Actor)</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{transfer.requestedBy?.name || 'Staff'}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Employee Recipient</span>
            <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
              {transfer.toEmployee?.user?.name || transfer.toEmployee?.name || <span className="text-slate-400 text-xs italic">Unassigned (Pool)</span>}
            </span>
          </div>
        </div>

        {/* Reason */}
        <div className="border-t border-slate-100 pt-4">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Reason for Transfer Request</span>
          <p className="text-sm text-slate-650 leading-relaxed bg-slate-50/50 p-3.5 border border-slate-200/50 rounded-xl italic">"{transfer.reason || 'None provided.'}"</p>
        </div>

        {/* Rejection context */}
        {transfer.status === 'rejected' && transfer.rejectionReason && (
          <div className="border-t border-rose-100 pt-4 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
            <span className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider mb-1">Rejection Reason</span>
            <p className="text-sm text-rose-750 font-medium">"{transfer.rejectionReason}"</p>
            <span className="block text-[10px] text-slate-400 mt-2">Rejected By: {transfer.rejectedBy?.name || 'Supervisor'}</span>
          </div>
        )}

        {/* Authorizer details */}
        {transfer.status === 'approved' && (
          <div className="border-t border-emerald-100 pt-4 text-xs text-slate-500">
            <p>Approved By: <span className="font-bold text-slate-700">{transfer.approvedBy?.name || 'System Admin'}</span> on {new Date(transfer.approvedAt || transfer.updatedAt).toLocaleDateString()}</p>
          </div>
        )}

        {/* Actions panel */}
        {transfer.status === 'pending' && (
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            {transfer.requestedBy?._id === user?._id && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel Request
              </button>
            )}
            {isApprover && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-250 hover:border-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Transfer
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  Approve Transfer
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* REJECTION MODAL */}
      {showRejectModal && (
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

export default TransferDetail;
