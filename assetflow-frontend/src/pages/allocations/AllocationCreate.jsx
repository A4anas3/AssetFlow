import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const AllocationCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryAssetId = searchParams.get('assetId') || '';

  const [asset, setAsset] = useState('');
  const [employee, setEmployee] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  // Conflict state
  const [takenAsset, setTakenAsset] = useState(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    setFetchLoading(true);
    try {
      const [empRes, allAssetsRes] = await Promise.all([
        api.get('/employees?limit=100&status=active'),
        api.get('/assets?limit=100') // fetch all to check taken conflicts
      ]);
      setEmployees(empRes.data.data.data || []);
      
      const allAssets = allAssetsRes.data.data.data || [];
      // available assets
      const avail = allAssets.filter(a => a.status === 'available');
      setAssets(avail);

      if (queryAssetId) {
        const preSelected = allAssets.find(a => a._id === queryAssetId);
        if (preSelected) {
          setAsset(preSelected._id);
          // Check conflict
          if (preSelected.status !== 'available') {
            setTakenAsset(preSelected);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load allocation options.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAssetChange = async (assetId) => {
    setAsset(assetId);
    setTakenAsset(null);
    if (!assetId) return;

    try {
      const { data } = await api.get(`/assets/${assetId}`);
      const selected = data.data;
      if (selected.status !== 'available') {
        setTakenAsset(selected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asset || !employee || !expectedReturnDate) {
      setError('Asset, Employee, and Return Date are required.');
      return;
    }

    if (takenAsset) {
      setError(`Conflict: This asset is currently held by another employee.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/allocations', {
        asset,
        employee,
        expectedReturnDate,
        notes
      });
      navigate('/allocations');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to allocate asset.');
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
          onClick={() => navigate('/allocations')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Allocate Asset</h2>
          <p className="text-slate-500 text-sm mt-0.5">Assign an available asset to a specific employee.</p>
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

      {takenAsset && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl space-y-3 shadow-sm shadow-amber-50/20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>
              Conflict: <span className="font-extrabold">{takenAsset.name} ({takenAsset.assetTag})</span> is currently held by another user and cannot be allocated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/transfers/create?assetId=${takenAsset._id}`)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Open Transfer Request Instead
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset to Allocate *</label>
          <select
            value={asset}
            onChange={(e) => handleAssetChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            required
          >
            <option value="">Select Asset</option>
            {/* If queryAssetId was passed and is taken, we still render it to show conflict */}
            {queryAssetId && !assets.some(a => a._id === queryAssetId) && takenAsset && (
              <option value={takenAsset._id}>
                [TAKEN] {takenAsset.name} ({takenAsset.assetTag})
              </option>
            )}
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.assetTag}) - Condition: {a.condition}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign To Employee *</label>
            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.user?.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Return Date *</label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allocation Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            placeholder="Add any specific checkout logs, peripheral accessories included..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/allocations')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !!takenAsset}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Checkout'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllocationCreate;
