import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ['admin', 'asset_manager'].includes(user?.role);

  const [audit, setAudit] = useState(null);
  const [report, setReport] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Auditor Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  // Asset Verification Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [verifyCondition, setVerifyCondition] = useState('good');
  const [verifyNotes, setVerifyNotes] = useState('');

  // Close Audit Modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeSummary, setCloseSummary] = useState('');

  useEffect(() => {
    fetchAuditAndReport();
    if (isPrivileged) {
      fetchEmployees();
    }
  }, [id]);

  const fetchAuditAndReport = async () => {
    setLoading(true);
    setError('');
    try {
      const [auditRes, reportRes] = await Promise.all([
        api.get(`/audits/${id}`),
        api.get(`/audits/${id}/report`)
      ]);
      setAudit(auditRes.data.data);
      setReport(reportRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch audit details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees?limit=100');
      setEmployees(response.data.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignAuditors = async (e) => {
    e.preventDefault();
    if (selectedAuditors.length === 0) {
      alert('Please select at least one auditor.');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/audits/${id}/assign-auditors`, {
        auditors: selectedAuditors
      });
      setShowAssignModal(false);
      fetchAuditAndReport();
      alert('Auditors assigned successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to assign auditors.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setActionLoading(true);
    try {
      await api.patch(`/audits/${id}/verify-asset`, {
        assetId: selectedAsset.asset._id || selectedAsset.asset,
        condition: verifyCondition,
        notes: verifyNotes
      });
      setShowVerifyModal(false);
      setSelectedAsset(null);
      setVerifyNotes('');
      fetchAuditAndReport();
      alert('Asset verification recorded.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to verify asset.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.patch(`/audits/${id}/close`, {
        summary: closeSummary
      });
      setShowCloseModal(false);
      setCloseSummary('');
      fetchAuditAndReport();
      alert('Audit cycle closed. Discrepancies processed and asset states updated.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to close audit cycle.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuditorSelect = (userId) => {
    if (selectedAuditors.includes(userId)) {
      setSelectedAuditors(selectedAuditors.filter(uid => uid !== userId));
    } else {
      setSelectedAuditors([...selectedAuditors, userId]);
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

  if (loading || !audit) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  const isAssignedAuditor = audit.auditors?.some(a => a._id === user?._id);
  const showVerifyActions = audit.status === 'in_progress' && (isAssignedAuditor || isPrivileged);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/audits')}
            className="p-2 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">{audit.title}</h2>
              {getStatusBadge(audit.status)}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Scope: {audit.department?.name || 'All'} • Location: {audit.location || 'All Areas'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {audit.status === 'planned' && isPrivileged && (
            <button
              onClick={() => {
                setSelectedAuditors(audit.auditors?.map(a => a._id) || []);
                setShowAssignModal(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
            >
              Assign Auditors
            </button>
          )}

          {audit.status === 'in_progress' && isPrivileged && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-600/10 cursor-pointer"
            >
              Close Audit Cycle
            </button>
          )}
        </div>
      </div>

      {/* Discrepancy KPI Metrics */}
      {report?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Assets</span>
            <span className="block text-2xl font-black text-slate-850 mt-1">{report.stats.total}</span>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-emerald-600">Verified</span>
            <span className="block text-2xl font-black text-emerald-600 mt-1">{report.stats.verified}</span>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-rose-600">Missing</span>
            <span className="block text-2xl font-black text-rose-600 mt-1">{report.stats.missing}</span>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-center">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-amber-600">Damaged</span>
            <span className="block text-2xl font-black text-amber-600 mt-1">{report.stats.damaged}</span>
          </div>
          <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining</span>
            <span className="block text-2xl font-black text-slate-500 mt-1">{report.stats.unverified}</span>
          </div>
        </div>
      )}

      {/* Summary box if closed */}
      {audit.status === 'closed' && audit.summary && (
        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl shadow-xs">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Closed Audit Summary</h4>
          <p className="text-sm text-slate-650 italic">"{audit.summary}"</p>
          <span className="block text-[10px] text-slate-400 mt-2">Closed on: {new Date(audit.closedAt || audit.updatedAt).toLocaleDateString()}</span>
        </div>
      )}

      {/* Asset verification items table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">Inventory Verification Registry</h3>
          <span className="text-xs text-slate-500 font-semibold">{audit.assets?.length || 0} Assets In Scope</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Asset Tag</th>
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Verified State</th>
                <th className="px-6 py-4">Audit Condition</th>
                <th className="px-6 py-4">Verification Notes</th>
                <th className="px-6 py-4">Verified By</th>
                {showVerifyActions && <th className="px-6 py-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {audit.assets?.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">
                    <Link to={`/assets/${item.asset?._id || item.asset}`} className="hover:text-teal-600 transition-colors underline">
                      {item.asset?.assetTag}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{item.asset?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {item.verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Unverified</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.verified ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        item.condition === 'good'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : item.condition === 'missing'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {item.condition}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate" title={item.notes}>{item.notes || '-'}</td>
                  <td className="px-6 py-4 text-slate-550 text-xs">{item.verifiedBy?.name || '-'}</td>
                  {showVerifyActions && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedAsset(item);
                          setVerifyCondition(item.condition || 'good');
                          setVerifyNotes(item.notes || '');
                          setShowVerifyModal(true);
                        }}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Verify Item
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN AUDITORS MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Assign Auditor Panel</h3>
            <p className="text-slate-500 text-xs mt-0.5">Select one or more employees to execute verification for this audit cycle.</p>
            <form onSubmit={handleAssignAuditors} className="space-y-4 mt-4">
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                {employees.map((emp) => {
                  const uid = emp.user?._id || emp.user;
                  const isChecked = selectedAuditors.includes(uid);
                  return (
                    <label key={emp._id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-100 hover:border-slate-200 cursor-pointer text-xs font-medium text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAuditorSelect(uid)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{emp.user?.name}</p>
                        <p className="text-[10px] text-slate-450">{emp.designation}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAuditors([]);
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
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY ASSET MODAL */}
      {showVerifyModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Verify Asset Registry</h3>
            <p className="text-slate-500 text-xs mt-0.5">Record status for: {selectedAsset.asset?.name} ({selectedAsset.asset?.assetTag})</p>
            <form onSubmit={handleVerifySubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audit Condition State</label>
                <select
                  value={verifyCondition}
                  onChange={(e) => setVerifyCondition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                >
                  <option value="good">Verified - Good Condition</option>
                  <option value="damaged">Verified - Damaged / Poor State</option>
                  <option value="missing">Not Found - Missing Item</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audit Check Notes</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  placeholder="Record serial confirmation or damage details..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedAsset(null);
                    setVerifyNotes('');
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
                  Confirm Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE AUDIT MODAL */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-800">Close Audit Cycle</h3>
            <p className="text-slate-500 text-xs mt-0.5">Closing the cycle locks all logs. Confirmed missing assets will be updated to LOST, and damaged items will update condition logs.</p>
            <form onSubmit={handleCloseSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Final Summary Report</label>
                <textarea
                  value={closeSummary}
                  onChange={(e) => setCloseSummary(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
                  placeholder="Record discrepancy summaries, required action steps, final remarks..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseModal(false);
                    setCloseSummary('');
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
                  Close Cycle & Process Statuses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuditDetail;
