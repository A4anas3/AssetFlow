import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ['admin', 'asset_manager'].includes(user?.role);

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState({ allocations: [], maintenance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // info, history, maintenance

  // Return Flow States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnCondition, setReturnCondition] = useState('good');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchAssetAndHistory();
  }, [id]);

  const fetchAssetAndHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const [assetRes, historyRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/assets/history/${id}`)
      ]);
      setAsset(assetRes.data.data);
      setHistory(historyRes.data.data || { allocations: [], maintenance: [] });
    } catch (err) {
      console.error(err);
      setError('Failed to load asset details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this asset record?')) return;
    try {
      await api.delete(`/assets/${id}`);
      navigate('/assets');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  // Mark returned and check-in condition notes
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setReturnLoading(true);
    try {
      // 1. Fetch active allocation ID for this asset
      const activeAlloc = history.allocations.find(a => a.status === 'active');
      if (!activeAlloc) {
        alert('No active allocation found for this asset.');
        return;
      }
      
      // 2. Submit check-in return note and condition
      await api.patch(`/allocations/${activeAlloc._id}/return`, {
        checkInNotes: returnNotes,
        checkInCondition: returnCondition
      });

      // 3. For Admin/Asset Manager, auto-approve the return
      if (isPrivileged) {
        await api.patch(`/allocations/${activeAlloc._id}/approve-return`, {
          checkInNotes: returnNotes,
          checkInCondition: returnCondition
        });
      }

      setShowReturnModal(false);
      setReturnNotes('');
      fetchAssetAndHistory();
      alert('Asset returned successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to return asset.');
    } finally {
      setReturnLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'allocated': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'reserved': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'in_maintenance': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'lost': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'retired': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'disposed': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'allocated': return 'Allocated';
      case 'reserved': return 'Reserved';
      case 'in_maintenance': return 'Maintenance';
      case 'lost': return 'Lost';
      case 'retired': return 'Retired';
      case 'disposed': return 'Disposed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl max-w-2xl mx-auto mt-10">
        <p className="font-bold">Error</p>
        <p className="text-sm mt-1">{error || 'Asset not found'}</p>
        <Link to="/assets" className="mt-4 inline-block px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const activeAllocation = history.allocations.find(a => a.status === 'active');
  const isHeldByMe = activeAllocation && activeAllocation.employee?.user?._id === user?._id;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-xs tracking-wide">
                {asset.assetTag}
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(asset.status)}`}>
                {getStatusLabel(asset.status)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">{asset.name}</h2>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          {isPrivileged && (
            <>
              <button
                onClick={() => navigate(`/assets/${id}/edit`)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer"
              >
                Edit Asset
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold border border-rose-100 shadow-sm transition-all duration-200 cursor-pointer"
              >
                Delete
              </button>
            </>
          )}

          {/* Allocation Actions */}
          {asset.status === 'available' && isPrivileged && (
            <button
              onClick={() => navigate(`/allocations/create?assetId=${asset._id}`)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
            >
              Allocate Asset
            </button>
          )}

          {asset.status === 'allocated' && (
            <>
              {/* Conflict handling: If Raj tries to allocate or transfer */}
              {!isHeldByMe ? (
                <button
                  onClick={() => navigate(`/transfers/create?assetId=${asset._id}`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
                  </svg>
                  Request Transfer
                </button>
              ) : (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  Return Asset
                </button>
              )}
            </>
          )}

          {/* Raise Maintenance Trigger */}
          {['available', 'allocated'].includes(asset.status) && (
            <button
              onClick={() => navigate(`/maintenance/create?assetId=${asset._id}`)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer"
            >
              Request Maintenance
            </button>
          )}
        </div>
      </div>

      {/* Conflict Warning banner */}
      {asset.status === 'allocated' && !isHeldByMe && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm shadow-amber-50/20">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>
              This asset is currently taken and held by <span className="font-bold">{activeAllocation?.employee?.user?.name || 'an Employee'}</span>. Double-allocation is blocked.
            </p>
          </div>
          <button
            onClick={() => navigate(`/transfers/create?assetId=${asset._id}`)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer text-center"
          >
            Initiate Transfer Request
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl border-t border-x border-slate-200/60 shadow-xs">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'info' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          General Specs
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Allocation History ({history.allocations.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'maintenance' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Maintenance Trail ({history.maintenance.length})
        </button>
      </div>

      {/* Tab Content Box */}
      <div className="bg-white border-b border-x border-slate-200/60 rounded-b-2xl p-6 shadow-sm shadow-slate-100/30">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Asset Name</span>
                <span className="text-sm font-semibold text-slate-800">{asset.name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Category</span>
                <span className="text-sm font-semibold text-slate-800">{asset.category?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Physical Condition</span>
                <span className="text-sm font-semibold text-slate-800 capitalize">{asset.condition}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Location Room</span>
                <span className="text-sm font-semibold text-slate-800">{asset.location || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Serial Number</span>
                <span className="text-sm font-semibold text-slate-800 uppercase">{asset.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Acquisition Date</span>
                <span className="text-sm font-semibold text-slate-800">
                  {asset.acquisitionDate ? new Date(asset.acquisitionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Acquisition Cost</span>
                <span className="text-sm font-black text-teal-600">
                  {asset.acquisitionCost ? `$${asset.acquisitionCost.toLocaleString()}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Use Classification</span>
                <span className="text-sm font-semibold text-slate-800">
                  {asset.isBookable ? 'Shared/Bookable Resource' : 'Private/Allocated Use Only'}
                </span>
              </div>
            </div>

            {/* Category Custom fields templates */}
            {asset.category?.customFields && asset.category.customFields.length > 0 && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category Specific Technical Fields</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-200/50 rounded-xl">
                  {asset.category.customFields.map((field, fIdx) => (
                    <div key={fIdx}>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{field.key}</span>
                      <span className="text-xs font-semibold text-slate-700 mt-0.5 block">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {asset.description && (
              <div className="border-t border-slate-100 pt-4">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Asset Description & Notes</span>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/30 p-3.5 border border-slate-100 rounded-xl">{asset.description}</p>
              </div>
            )}

            {/* Active Allocation Info Card */}
            {activeAllocation && (
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Assignment</h4>
                <div className="bg-indigo-50/40 border border-indigo-100/70 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      {activeAllocation.employee?.user?.name ? activeAllocation.employee.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{activeAllocation.employee?.user?.name}</p>
                      <p className="text-xs text-slate-500">{activeAllocation.employee?.designation} • {activeAllocation.employee?.user?.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="block text-slate-400 font-medium">Assigned on: {new Date(activeAllocation.createdAt).toLocaleDateString()}</span>
                    <span className="block font-bold text-indigo-600 mt-0.5">Due Return: {new Date(activeAllocation.expectedReturnDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Allocation history & checkout timeline</h3>
            {history.allocations.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">No assignment history logged for this asset.</div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
                {history.allocations.map((alloc) => (
                  <div key={alloc._id} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-300 ring-4 ring-slate-100" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-bold text-sm text-slate-800">{alloc.employee?.user?.name || 'N/A'}</span>
                        <span className={`inline-block px-2 py-0.25 text-[10px] font-bold rounded uppercase border ${
                          alloc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : alloc.status === 'returned'
                            ? 'bg-slate-50 text-slate-600 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {alloc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Allocated: {new Date(alloc.createdAt).toLocaleDateString()} • Due: {new Date(alloc.expectedReturnDate).toLocaleDateString()}
                      </p>
                      {alloc.returnDate && (
                        <p className="text-xs text-slate-600 font-semibold">
                          Returned: {new Date(alloc.returnDate).toLocaleDateString()} (Condition: <span className="capitalize">{alloc.checkInCondition || 'good'}</span>)
                        </p>
                      )}
                      {alloc.checkInNotes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 border border-slate-100 rounded-lg">Check-in Notes: "{alloc.checkInNotes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Maintenance logs & repair events</h3>
            {history.maintenance.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">No maintenance requests logged for this asset.</div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
                {history.maintenance.map((maint) => (
                  <div key={maint._id} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-350 ring-4 ring-slate-100" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-bold text-sm text-slate-850">Issue: {maint.description}</span>
                        <span className="inline-block px-2 py-0.25 text-[10px] font-bold rounded uppercase border bg-slate-50 text-slate-600 border-slate-200">
                          {maint.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Priority: <span className="font-semibold capitalize">{maint.priority}</span> • Requested: {new Date(maint.createdAt).toLocaleDateString()}
                      </p>
                      {maint.actualCost > 0 && (
                        <p className="text-xs font-bold text-teal-600">
                          Repair Cost: ${maint.actualCost.toLocaleString()}
                        </p>
                      )}
                      {maint.resolutionNotes && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 border border-slate-100 rounded-lg">Resolution: "{maint.resolutionNotes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  disabled={returnLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  {returnLoading ? 'Submitting...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetDetail;
