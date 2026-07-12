import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('utilization'); // utilization, maintenance, retirement, overdue, export
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [utilizationData, setUtilizationData] = useState(null);
  const [deptSummary, setDeptSummary] = useState([]);
  const [maintReport, setMaintReport] = useState(null);
  const [maintFreq, setMaintFreq] = useState(null);
  const [retirementData, setRetirementData] = useState(null);
  const [overdueData, setOverdueData] = useState(null);

  // Export state
  const [exportType, setExportType] = useState('assets');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [utilRes, deptRes, maintRes, freqRes, retireRes, overdueRes] = await Promise.all([
        api.get('/report/utilization'),
        api.get('/report/department-summary'),
        api.get('/report/maintenance'),
        api.get('/report/maintenance-frequency'),
        api.get('/report/nearing-retirement?days=90'),
        api.get('/report/overdue-allocations')
      ]);

      setUtilizationData(utilRes.data.data);
      setDeptSummary(deptRes.data.data || []);
      setMaintReport(maintRes.data.data);
      setMaintFreq(freqRes.data.data);
      setRetirementData(retireRes.data.data);
      setOverdueData(overdueRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reporting analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await api.get(`/report/export?type=${exportType}`);
      const data = response.data.data;
      
      // Generate blob and trigger browser download
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assetflow-report-${exportType}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export report.');
    } finally {
      setExportLoading(false);
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
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reports & Analytics</h2>
        <p className="text-slate-500 text-sm mt-0.5">Asset utilization stats, cost breakdowns, and discrepancy logs.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Overview stats layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Utilization Rate</span>
          <span className="block text-2xl font-black text-teal-600 mt-1">{utilizationData?.rate}%</span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{utilizationData?.utilized} allocated / {utilizationData?.total} total</span>
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Repair Outlay</span>
          <span className="block text-2xl font-black text-slate-850 mt-1">${maintReport?.totalCost?.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{maintReport?.records?.length || 0} tickets resolved</span>
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-rose-600">Overdue Returns</span>
          <span className="block text-2xl font-black text-rose-650 mt-1">{overdueData?.total || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Urgent returns pending</span>
        </div>

        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-amber-600">Warranty Alerts</span>
          <span className="block text-2xl font-black text-amber-650 mt-1">{retirementData?.warrantyExpiring?.length || 0}</span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Expiring in 90 days</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl border-t border-x border-slate-200/60 shadow-xs">
        <button
          onClick={() => setActiveTab('utilization')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'utilization' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Utilization Summary
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'maintenance' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Maintenance Trailing
        </button>
        <button
          onClick={() => setActiveTab('retirement')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'retirement' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Retirements & Expiry
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'overdue' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overdue Returns
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'export' ? 'border-teal-600 text-teal-600 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Export Registers
        </button>
      </div>

      {/* Tab Box */}
      <div className="bg-white border-b border-x border-slate-200/60 rounded-b-2xl p-6 shadow-sm shadow-slate-100/30">
        
        {activeTab === 'utilization' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-805">Department-wise asset allocation stats</h3>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Department Name</th>
                    <th className="px-6 py-3">Dept Code</th>
                    <th className="px-6 py-3 text-center">Total Assets</th>
                    <th className="px-6 py-3 text-center">Allocated</th>
                    <th className="px-6 py-3 text-center">Under Repair</th>
                    <th className="px-6 py-3 text-center">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {deptSummary.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{d.department?.name || 'Common Pool'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500 uppercase">{d.department?.code || '-'}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">{d.total}</td>
                      <td className="px-6 py-4 text-center text-indigo-600 font-medium">{d.allocated}</td>
                      <td className="px-6 py-4 text-center text-orange-600 font-medium">{d.inMaintenance}</td>
                      <td className="px-6 py-4 text-center text-emerald-600 font-medium">{d.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* By Asset */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 5 Repair-Frequent Assets</h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {maintFreq?.byAsset?.slice(0, 5).map((f) => (
                    <div key={f._id} className="p-3.5 flex justify-between items-center hover:bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-800">{f.asset?.name}</span>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mt-0.5">Tag: {f.asset?.assetTag}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-600 block">{f.count} Repairs</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">${f.totalCost || 0} Spent</span>
                      </div>
                    </div>
                  ))}
                  {(!maintFreq?.byAsset || maintFreq.byAsset.length === 0) && (
                    <div className="p-8 text-center text-slate-400">No data.</div>
                  )}
                </div>
              </div>

              {/* By Category */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Repair-Frequent Categories</h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {maintFreq?.byCategory?.slice(0, 5).map((c) => (
                    <div key={c._id} className="p-3.5 flex justify-between items-center hover:bg-slate-50">
                      <span className="font-bold text-slate-800">{c.category?.name || 'Unassigned'}</span>
                      <div className="text-right">
                        <span className="font-black text-rose-600 block">{c.count} Repairs</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">${c.totalCost || 0} Spent</span>
                      </div>
                    </div>
                  ))}
                  {(!maintFreq?.byCategory || maintFreq.byCategory.length === 0) && (
                    <div className="p-8 text-center text-slate-400">No data.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retirement' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-805">Hardware assets with warranties expiring in 90 days</h3>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Asset Tag</th>
                    <th className="px-6 py-3">Asset Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Warranty Expiry</th>
                    <th className="px-6 py-3">Department Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {retirementData?.warrantyExpiring?.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">{a.assetTag}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{a.name}</td>
                      <td className="px-6 py-4 text-slate-500">{a.category?.name}</td>
                      <td className="px-6 py-4 font-semibold text-rose-600">{new Date(a.warrantyExpiry).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600">{a.department?.name || 'Shared'}</td>
                    </tr>
                  ))}
                  {(!retirementData?.warrantyExpiring || retirementData.warrantyExpiring.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-450 text-xs">No assets due for retirement or warranty alert.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'overdue' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-805">Active allocations past checkout limits</h3>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Asset Tag</th>
                    <th className="px-6 py-3">Asset Name</th>
                    <th className="px-6 py-3">Checkout Holder</th>
                    <th className="px-6 py-3">Expected Return</th>
                    <th className="px-6 py-3">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {overdueData?.allocations?.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase tracking-tight">{a.asset?.assetTag}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{a.asset?.name}</td>
                      <td className="px-6 py-4 text-slate-600">{a.employee?.user?.name || 'Staff'}</td>
                      <td className="px-6 py-4 font-semibold text-rose-600">{new Date(a.expectedReturnDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-black text-rose-700 animate-pulse">{a.daysOverdue} Days</td>
                    </tr>
                  ))}
                  {(!overdueData?.allocations || overdueData.allocations.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-450 text-xs">No overdue asset returns registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-5 max-w-md">
            <div>
              <h3 className="text-sm font-bold text-slate-805">Export Inventory Registers</h3>
              <p className="text-slate-500 text-xs mt-0.5">Download full dataset registries in JSON format for external reporting.</p>
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Register Type</label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-medium"
              >
                <option value="assets">Assets Register</option>
                <option value="allocations">Checkout Allocations</option>
                <option value="maintenance">Maintenance Trail Logs</option>
                <option value="bookings">Shared Bookings Register</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="w-full px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {exportLoading ? (
                <span>Generating Export...</span>
              ) : (
                <>
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download JSON Register
                </>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Reports;
