import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AssetList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPrivileged = ['admin', 'asset_manager'].includes(user?.role);

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBookable, setSelectedBookable] = useState('');

  useEffect(() => {
    fetchMetadata();
    fetchAssets();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catRes, deptRes] = await Promise.all([
        api.get('/categories?limit=100'),
        api.get('/departments?limit=100')
      ]);
      setCategories(catRes.data.data?.data || catRes.data.data || []);
      setDepartments(deptRes.data.data.data || []);
    } catch (err) {
      console.error('Failed to fetch filter metadata:', err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      // Build query string
      let url = '/assets?limit=100';
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedDepartment) url += `&department=${selectedDepartment}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;
      
      const response = await api.get(url);
      let list = response.data.data.data || [];

      // Frontend filtering for text search and bookable flag to support custom requirements
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        list = list.filter(asset => 
          asset.name.toLowerCase().includes(query) ||
          asset.assetTag?.toLowerCase().includes(query) ||
          asset.serialNumber?.toLowerCase().includes(query) ||
          asset.location?.toLowerCase().includes(query)
        );
      }

      if (selectedBookable) {
        const isBook = selectedBookable === 'true';
        list = list.filter(asset => asset.isBookable === isBook);
      }

      setAssets(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load asset directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [selectedCategory, selectedDepartment, selectedStatus, selectedBookable]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
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

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">Assets Catalog</h2>
          <p className="text-slate-500 text-sm mt-0.5">Browse and search registered hardware, equipment, furniture, and rooms.</p>
        </div>
        {isPrivileged && (
          <button
            onClick={() => navigate('/assets/create')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Register Asset
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shadow-slate-100/30 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              placeholder="Search by asset tag, name, serial number, location..."
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100/70">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="">All Lifecycle Statuses</option>
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
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sharing Type</label>
            <select
              value={selectedBookable}
              onChange={(e) => setSelectedBookable(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="">All Types</option>
              <option value="true">Shared / Bookable Resource</option>
              <option value="false">Allocated/Private Use Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Listing */}
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
      ) : assets.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="font-semibold text-sm">No assets match your search criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or adding a new hardware asset.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset._id}
              onClick={() => navigate(`/assets/${asset._id}`)}
              className="bg-white border border-slate-200/60 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              
              {/* Asset Tag Header */}
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded shadow-xs tracking-wide group-hover:bg-slate-100/80 transition-colors">
                  {asset.assetTag}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(asset.status)}`}>
                  {getStatusLabel(asset.status)}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight group-hover:text-teal-600 transition-colors">
                  {asset.name}
                </h3>
                <p className="text-slate-400 text-xs truncate">{asset.description || 'No description provided.'}</p>
              </div>

              {/* Meta indicators */}
              <div className="pt-3 border-t border-slate-100/80 grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-0.5">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</span>
                  <span className="text-slate-700 font-semibold truncate block">{asset.category?.name || 'N/A'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</span>
                  <span className="text-slate-700 font-semibold truncate block">{asset.location || 'N/A'}</span>
                </div>
                <div className="space-y-0.5 mt-1.5">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Condition</span>
                  <span className="text-slate-600 font-medium capitalize block">{asset.condition}</span>
                </div>
                <div className="space-y-0.5 mt-1.5">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Use Type</span>
                  <span className="text-slate-600 font-medium block">
                    {asset.isBookable ? 'Shared/Bookable' : 'Private/Allocated'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetList;
