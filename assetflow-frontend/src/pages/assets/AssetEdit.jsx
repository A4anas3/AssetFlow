import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

const AssetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('good');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState(0);
  const [description, setDescription] = useState('');
  const [isBookable, setIsBookable] = useState(false);
  const [status, setStatus] = useState('available');

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssetAndMetadata();
  }, [id]);

  const fetchAssetAndMetadata = async () => {
    setFetchLoading(true);
    try {
      const [catRes, deptRes, assetRes] = await Promise.all([
        api.get('/categories?limit=100'),
        api.get('/departments?limit=100'),
        api.get(`/assets/${id}`)
      ]);

      setCategories(catRes.data.data?.data || catRes.data.data || []);
      setDepartments(deptRes.data.data.data || []);

      const asset = assetRes.data.data;
      setName(asset.name);
      setAssetTag(asset.assetTag || '');
      setSerialNumber(asset.serialNumber || '');
      setCategory(asset.category?._id || asset.category || '');
      setDepartment(asset.department?._id || asset.department || '');
      setLocation(asset.location || '');
      setCondition(asset.condition || 'good');
      setAcquisitionDate(asset.acquisitionDate ? asset.acquisitionDate.split('T')[0] : '');
      setAcquisitionCost(asset.acquisitionCost || asset.purchaseValue || 0);
      setDescription(asset.description || '');
      setIsBookable(asset.isBookable || false);
      setStatus(asset.status || 'available');
    } catch (err) {
      console.error(err);
      setError('Failed to load asset details.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !assetTag || !category) {
      setError('Name, Asset Tag and Category are required.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name,
      assetTag,
      serialNumber,
      category,
      department: department || null,
      location,
      condition,
      acquisitionDate,
      purchaseDate: acquisitionDate,
      acquisitionCost: Number(acquisitionCost),
      purchaseValue: Number(acquisitionCost),
      description,
      isBookable,
      status
    };

    try {
      await api.put(`/assets/${id}`, payload);
      navigate(`/assets/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update asset.');
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
          onClick={() => navigate(`/assets/${id}`)}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Edit Asset</h2>
          <p className="text-slate-500 text-sm mt-0.5">Modify information and state for asset tag: {assetTag}.</p>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset Tag *</label>
            <input
              type="text"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-bold uppercase"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department (Owner)</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="">None (Common/Shared Pool)</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lifecycle Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="reserved">Reserved</option>
              <option value="in_maintenance">Under Maintenance</option>
              <option value="lost">Lost</option>
              <option value="retired">Retired</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Physical Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serial Number</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Acquisition Cost ($)</label>
            <input
              type="number"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location / Room</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex flex-col justify-center">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Shared Bookable resource?</span>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={isBookable}
                onChange={(e) => setIsBookable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              <span className="ml-3 text-xs font-semibold text-slate-600">
                {isBookable ? 'Yes, shared bookable resource' : 'No, private/allocated only'}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(`/assets/${id}`)}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetEdit;
