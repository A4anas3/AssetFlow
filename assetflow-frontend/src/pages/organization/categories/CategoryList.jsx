import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { OrgSetupTabs } from '../departments/DepartmentList';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/categories?limit=100');
      setCategories(response.data.data?.data || response.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch asset categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Organization Setup</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage the hierarchy, employee structure, and asset metadata.</p>
        </div>
        <button
          onClick={() => navigate('/organization/categories/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      <OrgSetupTabs activeTab="categories" />

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white border border-slate-200/60 rounded-b-2xl shadow-sm shadow-slate-100/10">
          <svg className="animate-spin h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-b-2xl">
          <p className="font-semibold">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-b-2xl p-12 text-center text-slate-400">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <p className="font-semibold text-sm">No asset categories registered yet</p>
          <button
            onClick={() => navigate('/organization/categories/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-b-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Depreciation Rate</th>
                  <th className="px-6 py-4">Default Warranty</th>
                  <th className="px-6 py-4">Custom Fields Template</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || 'No description'}</td>
                    <td className="px-6 py-4 font-semibold text-teal-600">{cat.depreciationRate}% / year</td>
                    <td className="px-6 py-4 text-slate-700">{cat.defaultWarrantyMonths ? `${cat.defaultWarrantyMonths} Months` : 'N/A'}</td>
                    <td className="px-6 py-4">
                      {cat.customFields && cat.customFields.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {cat.customFields.map((field, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full"
                              title={`${field.key}: ${field.value}`}
                            >
                              {field.key} ({field.value})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/organization/categories/${cat._id}/edit`)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
