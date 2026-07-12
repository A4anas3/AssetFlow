import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ['admin', 'asset_manager'].includes(user?.role);

  const [ticket, setTicket] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [actualCost, setActualCost] = useState(0);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchTicket();
    if (isPrivileged) {
      fetchEmployees();
    }
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/maintenance/${id}`);
      setTicket(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load maintenance ticket.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data.data || []);
    } catch (err) {
      console.error('Failed to load employee list:', err);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this maintenance request?')) return;
    setActionLoading(true);
    try {
      await api.patch(`/maintenance/${id}/approve`);
      fetchTicket();
      alert('Maintenance request approved. Asset status set to Under Maintenance.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason) return;
    setActionLoading(true);
    try {
      await api.patch(`/maintenance/${id}/reject`, {
        reason: rejectReason
      });
      setShowRejectModal(false);
      setRejectReason('');
      fetchTicket();
      alert('Maintenance request rejected.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechnician) return;
    setActionLoading(true);
    try {
      await api.patch(`/maintenance/${id}/assign`, {
        assignedTo: selectedTechnician
      });
      setShowAssignModal(false);
      setSelectedTechnician('');
      fetchTicket();
      alert('Technician assigned successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRepair = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/maintenance/${id}/start`);
      fetchTicket();
      alert('Repair started successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to start repair.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.patch(`/maintenance/${id}/resolve`, {
        actualCost: Number(actualCost),
        notes: resolutionNotes
      });
      setShowResolveModal(false);
      setActualCost(0);
      setResolutionNotes('');
      fetchTicket();
      alert('Ticket resolved successfully. Asset is now available.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to resolve ticket.');
    } finally {
      setActionLoading(false);
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
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">Pending Approval</span>;
      case 'approved':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">Approved</span>;
      case 'in_progress':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 animate-pulse">In Progress</span>;
      case 'completed':
      case 'resolved':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Resolved</span>;
      case 'rejected':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">Rejected</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
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

  if (error || !ticket) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl max-w-2xl mx-auto mt-10">
        <p className="font-bold">Error</p>
        <p className="text-sm mt-1">{error || 'Ticket not found'}</p>
        <Link to="/maintenance" className="mt-4 inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Back to tickets
        </Link>
      </div>
    );
  }

  const isAssignedTechnician = ticket.assignedTo?._id === user?._id;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/maintenance')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Maintenance Ticket</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track diagnostic logs, technicians, and repair costs.</p>
        </div>
      </div>

      {/* Ticket Details Panel */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-6">
        
        {/* Ticket Header status */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ticket Status</span>
            <div className="mt-1">{getStatusBadge(ticket.status)}</div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Priority Level</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mt-1 ${getPriorityBadgeColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* Linked Asset */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl flex justify-between items-center">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Asset Item</span>
            <span className="text-base font-extrabold text-slate-800 mt-0.5 block">{ticket.asset?.name}</span>
            <span className="text-xs font-bold text-slate-550 uppercase mt-0.5 block">Tag: {ticket.asset?.assetTag}</span>
          </div>
          <Link
            to={`/assets/${ticket.asset?._id || ticket.asset}`}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
          >
            Catalog Detail
          </Link>
        </div>

        {/* Short info layout */}
        <div className="space-y-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Issue Title</span>
            <span className="text-base font-extrabold text-slate-800 mt-0.5 block">{ticket.title}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Problem Description</span>
            <p className="text-sm text-slate-650 mt-1 leading-relaxed bg-slate-50/50 p-4 border border-slate-200/50 rounded-xl">
              {ticket.description || 'No detailed issue description was provided.'}
            </p>
          </div>
        </div>

        {/* Cost & Technician specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border-t border-slate-100 pt-4 text-sm">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requested By</span>
            <span className="font-semibold text-slate-700 block mt-0.5">{ticket.requestedBy?.name} ({ticket.requestedBy?.email})</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Technician</span>
            <span className="font-semibold text-slate-700 block mt-0.5">
              {ticket.assignedTo?.name ? (
                `${ticket.assignedTo.name} (${ticket.assignedTo.email})`
              ) : (
                <span className="text-slate-400 text-xs italic">Not assigned</span>
              )}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Repair Cost</span>
            <span className="font-semibold text-slate-700 block mt-0.5">${ticket.estimatedCost || 0}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Actual Repair Cost</span>
            <span className="font-extrabold text-teal-600 block mt-0.5">${ticket.actualCost || 0}</span>
          </div>
        </div>

        {/* Resolution logs */}
        {ticket.notes && (
          <div className="border-t border-slate-100 pt-4">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Technician Resolution Notes</span>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 border border-slate-100 rounded-xl leading-relaxed italic">"{ticket.notes}"</p>
          </div>
        )}

        {/* Rejection logs */}
        {ticket.status === 'rejected' && ticket.rejectionReason && (
          <div className="border-t border-rose-100 pt-4 bg-rose-50/40 p-4 rounded-xl border border-rose-100">
            <span className="block text-[10px] text-rose-600 font-bold uppercase tracking-wider mb-1">Rejection Reason</span>
            <p className="text-sm text-rose-750 font-medium">"{ticket.rejectionReason}"</p>
          </div>
        )}

        {/* Maintenance Actions Control */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          {ticket.status === 'pending' && isPrivileged && (
            <>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-250 hover:border-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
              >
                Approve Request
              </button>
            </>
          )}

          {/* Technicians assignment */}
          {['approved', 'assigned'].includes(ticket.status) && isPrivileged && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
            >
              {ticket.assignedTo ? 'Reassign Technician' : 'Assign Technician'}
            </button>
          )}

          {/* Start Repair action */}
          {ticket.status === 'assigned' && (isAssignedTechnician || isPrivileged) && (
            <button
              type="button"
              onClick={handleStartRepair}
              disabled={actionLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
            >
              Start Diagnostic Repair
            </button>
          )}

          {/* Resolve repair logging cost */}
          {ticket.status === 'in_progress' && (isAssignedTechnician || isPrivileged) && (
            <button
              type="button"
              onClick={() => setShowResolveModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
            >
              Resolve & Log Cost
            </button>
          )}
        </div>
      </div>

      {/* REJECTION MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Reject Maintenance Request</h3>
            <p className="text-slate-500 text-xs mt-0.5">Please provide a reason for rejecting this maintenance ticket.</p>
            <form onSubmit={handleRejectSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  placeholder="Specify why the repair request is rejected..."
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

      {/* ASSIGN TECHNICIAN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Assign Technician</h3>
            <p className="text-slate-500 text-xs mt-0.5">Dispatch an employee technician to resolve this ticket.</p>
            <form onSubmit={handleAssignSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Technician</label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  required
                >
                  <option value="">Select Technician</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp.user?._id || emp.user}>
                      {emp.user?.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTechnician('');
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
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE TICKET MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Resolve Maintenance Ticket</h3>
            <p className="text-slate-500 text-xs mt-0.5">Confirm resolution details, repair description, and log actual financial cost.</p>
            <form onSubmit={handleResolveSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Actual Repair Cost ($)</label>
                <input
                  type="number"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Resolution / Repair Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  placeholder="Specify replacement parts used, warranty status..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowResolveModal(false);
                    setActualCost(0);
                    setResolutionNotes('');
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
                  Confirm Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaintenanceDetail;
