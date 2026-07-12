import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const Settings = () => {
  const [settings, setSettings] = useState({
    appName: 'AssetFlow Enterprise',
    enableEmailAlerts: 'true',
    autoApproveTransfers: 'false',
    sessionTimeoutMinutes: '60',
    defaultAssetWarrantyMonths: '12'
  });
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/settings');
      const data = response.data.data;
      if (data && Object.keys(data).length > 0) {
        // Map all returned keys
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch settings configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }));
  };

  const handleChange = (key, val) => {
    setSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/settings', settings);
      setSuccess('Enterprise settings updated successfully.');
      fetchSettings();
    } catch (err) {
      console.error(err);
      setError('Failed to save settings modifications.');
    } finally {
      setSaveLoading(false);
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Configure global ERP rules, notifications, and parameters.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-semibold">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-6">
        
        {/* App Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ERP Platform Name</label>
          <input
            type="text"
            value={settings.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-semibold"
            required
          />
        </div>

        {/* Numeric parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Session Timeout (Minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => handleChange('sessionTimeoutMinutes', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-semibold"
              min="5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Warranty Period (Months)</label>
            <input
              type="number"
              value={settings.defaultAssetWarrantyMonths}
              onChange={(e) => handleChange('defaultAssetWarrantyMonths', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-semibold"
              min="1"
              required
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toggles & Rules</h3>
          
          {/* Email alerts */}
          <div className="flex justify-between items-center p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl">
            <div>
              <span className="text-sm font-bold text-slate-800 block">System Email Dispatch alerts</span>
              <span className="text-xs text-slate-400 block mt-0.5">Send alerts for transfers, audits and overdue checks.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailAlerts === 'true'}
                onChange={() => handleToggle('enableEmailAlerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Auto transfers */}
          <div className="flex justify-between items-center p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl">
            <div>
              <span className="text-sm font-bold text-slate-800 block">Auto-Approve Inter-Dept Transfers</span>
              <span className="text-xs text-slate-400 block mt-0.5">Bypass approval queue if departments belong to the same parent.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApproveTransfers === 'true'}
                onChange={() => handleToggle('autoApproveTransfers')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer disabled:opacity-50"
          >
            {saveLoading ? 'Saving...' : 'Save ERP Rules'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
