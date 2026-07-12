import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const TransferCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryAssetId = searchParams.get('assetId') || '';

  const [assetId, setAssetId] = useState('');
  const [fromDeptId, setFromDeptId] = useState('');
  const [fromDeptName, setFromDeptName] = useState('');
  const [toDeptId, setToDeptId] = useState('');
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [reason, setReason] = useState('');

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    setFetchLoading(true);
    try {
      const [allAssetsRes, deptsRes, empsRes] = await Promise.all([
        api.get('/assets?limit=100'),
        api.get('/departments?limit=100'),
        api.get('/employees?limit=100&status=active')
      ]);

      const allAssets = allAssetsRes.data.data.data || [];
      // Filter out assets that are allocated (must be allocated to be transferred!)
      const allocated = allAssets.filter(a => a.status === 'allocated');
      setAssets(allocated);
      
      setDepartments(deptsRes.data.data.data || []);
      setEmployees(empsRes.data.data.data || []);

      if (queryAssetId) {
        const preSelected = allAssets.find(a => a._id === queryAssetId);
        if (preSelected) {
          setAssetId(preSelected._id);
          setFromDeptId(preSelected.department?._id || preSelected.department || '');
          setFromDeptName(preSelected.department?.name || 'Common Pool');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load transfer metadata.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAssetChange = (id) => {
    setAssetId(id);
    if (!id) {
      setFromDeptId('');
      setFromDeptName('');
      return;
    }
    const selected = assets.find(a => a._id === id);
    if (selected) {
      setFromDeptId(selected.department?._id || selected.department || '');
      setFromDeptName(selected.department?.name || 'Common Pool');
    }
  };

  // When target department changes, filter employees to only those in the target department
  useEffect(() => {
    if (!toDeptId) {
      setFilteredEmployees([]);
      setToEmployeeId('');
      return;
    }
    const filtered = employees.filter(emp => emp.department?._id === toDeptId || emp.department === toDeptId);
    setFilteredEmployees(filtered);
    setToEmployeeId('');
  }, [toDeptId, employees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId || !toDeptId || !reason) {
      setError('Asset, Target Department, and Reason are required.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      asset: assetId,
      fromDepartment: fromDeptId || null,
      toDepartment: toDeptId,
      toEmployee: toEmployeeId || null,
      reason
    };

    try {
      await api.post('/transfers', payload);
      navigate('/transfers');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit transfer request.');
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
          onClick={() => navigate('/transfers')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Request Transfer</h2>
          <p className="text-slate-500 text-sm mt-0.5">Submit an inter-department asset transfer request for approval.</p>
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset to Transfer *</label>
          <select
            value={assetId}
            onChange={(e) => handleAssetChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            required
          >
            <option value="">Select Allocated Asset</option>
            {queryAssetId && !assets.some(a => a._id === queryAssetId) && (
              <option value={queryAssetId}>
                Pre-selected Asset (Currently Checkout)
              </option>
            )}
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.assetTag}) - Held by: {a.assignedTo?.user?.name || 'Staff'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Department</label>
            <input
              type="text"
              value={fromDeptName || 'Pool'}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold uppercase cursor-not-allowed"
              readOnly
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Department (To) *</label>
            <select
              value={toDeptId}
              onChange={(e) => setToDeptId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              required
            >
              <option value="">Select Target Department</option>
              {departments
                .filter(d => d._id !== fromDeptId) // filter current department out
                .map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Employee Recipient (optional)</label>
          <select
            value={toEmployeeId}
            onChange={(e) => setToEmployeeId(e.target.value)}
            disabled={!toDeptId}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Assign to Department Pool (Common)</option>
            {filteredEmployees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.user?.name} ({emp.designation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Transfer *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            placeholder="State why this transfer is needed (e.g. employee resignation, reassignment of task force)..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/transfers')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferCreate;
