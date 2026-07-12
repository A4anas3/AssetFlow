import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const CategoryCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [depreciationRate, setDepreciationRate] = useState(10);
  const [defaultWarrantyMonths, setDefaultWarrantyMonths] = useState(12);
  const [parentCategory, setParentCategory] = useState('');
  
  // Custom fields: array of { key, value }
  const [customFields, setCustomFields] = useState([{ key: '', value: '' }]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?limit=100');
      setCategories(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleAddField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    const updated = customFields.filter((_, idx) => idx !== index);
    setCustomFields(updated);
  };

  const handleFieldChange = (index, prop, val) => {
    const updated = [...customFields];
    updated[index][prop] = val;
    setCustomFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Category Name is required.');
      return;
    }

    setLoading(true);
    setError('');

    // filter empty custom fields
    const filteredFields = customFields.filter(f => f.key.trim() && f.value.trim());

    const payload = {
      name,
      description,
      depreciationRate: Number(depreciationRate),
      defaultWarrantyMonths: Number(defaultWarrantyMonths),
      parentCategory: parentCategory || null,
      customFields: filteredFields
    };

    try {
      await api.post('/categories', payload);
      navigate('/organization/categories');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/organization/categories')}
          className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add Asset Category</h2>
          <p className="text-slate-500 text-sm mt-0.5">Define a new category and specification fields for assets.</p>
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              placeholder="e.g. Electronics, Vehicles, Furniture"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parent Category (optional)</label>
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            >
              <option value="">None (Top Level)</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
            placeholder="Describe the asset type category..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Depreciation Rate (% per year)</label>
            <input
              type="number"
              value={depreciationRate}
              onChange={(e) => setDepreciationRate(e.target.value)}
              min="0"
              max="100"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Warranty Period (Months)</label>
            <input
              type="number"
              value={defaultWarrantyMonths}
              onChange={(e) => setDefaultWarrantyMonths(e.target.value)}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all text-sm font-medium"
              placeholder="12"
            />
          </div>
        </div>

        {/* Dynamic Custom Fields Area */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Category-Specific Fields</h3>
              <p className="text-slate-400 text-xs mt-0.5">Add custom specification fields (e.g. warranty period, fuel type, resolution)</p>
            </div>
            <button
              type="button"
              onClick={handleAddField}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Field Key
            </button>
          </div>

          <div className="space-y-2">
            {customFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-3 animate-fadeIn">
                <div className="flex-1">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-xs"
                    placeholder="Field Key (e.g. Warranty Period)"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-xs"
                    placeholder="Default Value (e.g. 24 months)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveField(idx)}
                  className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-lg cursor-pointer transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/organization/categories')}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryCreate;
