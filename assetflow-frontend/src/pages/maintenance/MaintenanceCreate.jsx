import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const MaintenanceCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryAssetId = searchParams.get('assetId') || '';

  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setFetchLoading(true);
    try {
      const response = await api.get('/assets?limit=100');
      const all = response.data.data.data || [];
      // Only assets that are not lost, retired, or disposed can be repaired
      const repairable = all.filter(a => !['lost', 'retired', 'disposed'].includes(a.status));
      setAssets(repairable);

      if (queryAssetId) {
        setAssetId(queryAssetId);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch asset metadata.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId || !title) {
      setError('Asset and Title are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/maintenance', {
        asset: assetId,
        title,
        description,
        priority
      });
      navigate('/maintenance');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit maintenance request.');
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
          onClick={() => navigate('/maintenance')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Raise Ticket</h2>
          <p className="text-slate-500 text-sm mt-0.5">Report a fault, software malfunction, or hardware damage.</p>
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
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Asset *</label>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            required
          >
            <option value="">Select Asset</option>
            {assets.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.assetTag}) - Status: {a.status}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              placeholder="e.g. Cracked Laptop Screen, RAM expansion request"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Urgency Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detailed Issue Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
            placeholder="Describe the malfunction, reproduction steps, peripheral issues..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/maintenance')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {loading ? 'Submitting...' : 'Raise Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceCreate;
