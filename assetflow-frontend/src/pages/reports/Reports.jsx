import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

// ─── Pure SVG Bar Chart (no external library) ───────────────────────────────
const BarChart = ({ data, valueKey, labelKey, color = '#14b8a6', height = 180, label }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-xs font-semibold">
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const barW = Math.min(48, Math.floor(560 / data.length) - 8);
  const chartW = data.length * (barW + 12);
  const paddingBottom = 36;
  const paddingTop = 16;
  const chartH = height - paddingBottom - paddingTop;

  return (
    <div className="w-full overflow-x-auto">
      {label && <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>}
      <svg
        width={Math.max(chartW, 300)}
        height={height}
        className="block"
        style={{ minWidth: '100%' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = paddingTop + chartH - fraction * chartH;
          return (
            <g key={fraction}>
              <line x1={0} y1={y} x2={Math.max(chartW, 300)} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={0} y={y - 2} fontSize="9" fill="#94a3b8" textAnchor="start">
                {Math.round(fraction * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const val = item[valueKey] || 0;
          const barH = Math.max((val / maxVal) * chartH, 2);
          const x = idx * (barW + 12) + 16;
          const y = paddingTop + chartH - barH;
          const lbl = (item[labelKey] || 'N/A').toString().slice(0, 10);

          return (
            <g key={idx}>
              {/* Bar shadow */}
              <rect x={x + 2} y={y + 2} width={barW} height={barH} rx="5" fill="rgba(0,0,0,0.05)" />
              {/* Bar */}
              <rect x={x} y={y} width={barW} height={barH} rx="5" fill={color} opacity="0.88" />
              {/* Value label */}
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">
                {val}
              </text>
              {/* X-axis label */}
              <text
                x={x + barW / 2}
                y={paddingTop + chartH + 14}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                fontWeight="600"
              >
                {lbl}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── SVG Horizontal Bar Chart for maintenance frequency ──────────────────────
const HorizBarChart = ({ data, valueKey, labelKey, color = '#f43f5e', label }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-xs font-semibold">
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const rowH = 36;
  const labelW = 120;
  const barAreaW = 200;
  const totalH = data.length * rowH + 10;

  return (
    <div className="w-full overflow-x-auto">
      {label && <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>}
      <svg width={labelW + barAreaW + 60} height={totalH} className="block">
        {data.map((item, idx) => {
          const val = item[valueKey] || 0;
          const barW = Math.max((val / maxVal) * barAreaW, 4);
          const y = idx * rowH + 8;
          const lbl = (item[labelKey] || 'N/A').toString().slice(0, 16);

          return (
            <g key={idx}>
              <text x={labelW - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize="11" fill="#475569" fontWeight="600">
                {lbl}
              </text>
              {/* Track */}
              <rect x={labelW} y={y + 8} width={barAreaW} height={rowH - 18} rx="4" fill="#f8fafc" />
              {/* Bar */}
              <rect x={labelW} y={y + 8} width={barW} height={rowH - 18} rx="4" fill={color} opacity="0.82" />
              {/* Value */}
              <text x={labelW + barW + 6} y={y + rowH / 2 + 4} fontSize="11" fill="#334155" fontWeight="800">
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Main Reports Page ────────────────────────────────────────────────────────
const Reports = () => {
  const [activeTab, setActiveTab] = useState('utilization');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [utilizationData, setUtilizationData] = useState(null);
  const [deptSummary, setDeptSummary] = useState([]);
  const [maintReport, setMaintReport] = useState(null);
  const [maintFreq, setMaintFreq] = useState(null);
  const [retirementData, setRetirementData] = useState(null);
  const [overdueData, setOverdueData] = useState(null);

  const [exportType, setExportType] = useState('assets');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Fixed: /report → /reports (matches backend /api/reports route)
      const [utilRes, deptRes, maintRes, freqRes, retireRes, overdueRes] = await Promise.all([
        api.get('/reports/utilization'),
        api.get('/reports/department-summary'),
        api.get('/reports/maintenance'),
        api.get('/reports/maintenance-frequency'),
        api.get('/reports/nearing-retirement?days=90'),
        api.get('/reports/overdue-allocations'),
      ]);

      setUtilizationData(utilRes.data.data);
      setDeptSummary(deptRes.data.data || []);
      setMaintReport(maintRes.data.data);
      setMaintFreq(freqRes.data.data);
      setRetirementData(retireRes.data.data);
      setOverdueData(overdueRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reporting analytics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // ✅ Fixed: /report → /reports
      const response = await api.get(`/reports/export?type=${exportType}`);
      const data = response.data.data;
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

  // Build chart data from deptSummary
  const deptChartData = deptSummary.map((d) => ({
    label: d.department?.name || 'Shared',
    allocated: d.allocated || 0,
    available: d.available || 0,
    inMaintenance: d.inMaintenance || 0,
    total: d.total || 0,
  }));

  // Build chart data from maintFreq
  const assetFreqData = (maintFreq?.byAsset || []).slice(0, 6).map((f) => ({
    label: f.asset?.name || 'Unknown',
    count: f.count || 0,
  }));

  const categoryFreqData = (maintFreq?.byCategory || []).slice(0, 6).map((c) => ({
    label: c.category?.name || 'Unassigned',
    count: c.count || 0,
  }));

  const TABS = [
    { key: 'utilization', label: 'Utilization' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'retirement', label: 'Retirements & Expiry' },
    { key: 'overdue', label: 'Overdue Returns' },
    { key: 'export', label: 'Export' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <svg className="animate-spin h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold text-sm">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Reports &amp; Analytics</h2>
        <p className="text-slate-500 text-sm mt-0.5">Asset utilization stats, maintenance trends, cost breakdowns, and discrepancy logs.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-center gap-3">
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-bold">Error loading reports</p>
            <p className="font-medium mt-0.5">{error}</p>
          </div>
          <button onClick={fetchAllReports} className="ml-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Utilization Rate</span>
          <span className="block text-2xl font-black text-teal-600 mt-1">{utilizationData?.rate ?? '—'}%</span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            {utilizationData?.utilized ?? 0} allocated / {utilizationData?.total ?? 0} total
          </span>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Repair Outlay</span>
          <span className="block text-2xl font-black text-slate-800 mt-1">
            ${maintReport?.totalCost?.toLocaleString() ?? '0'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            {maintReport?.records?.length ?? 0} tickets total
          </span>
        </div>
        <div className="bg-white border border-rose-100/60 p-5 rounded-2xl shadow-sm border">
          <span className="block text-[10px] text-rose-500 font-bold uppercase tracking-wider">Overdue Returns</span>
          <span className="block text-2xl font-black text-rose-600 mt-1">{overdueData?.total ?? 0}</span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Urgent returns pending</span>
        </div>
        <div className="bg-white border border-amber-100/60 p-5 rounded-2xl shadow-sm border">
          <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider">Warranty Alerts</span>
          <span className="block text-2xl font-black text-amber-600 mt-1">
            {retirementData?.warrantyExpiring?.length ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Expiring in 90 days</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl border-t border-x border-slate-200/60 shadow-xs gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="bg-white border-b border-x border-slate-200/60 rounded-b-2xl p-6 shadow-sm shadow-slate-100/30">

        {/* ── UTILIZATION TAB ── */}
        {activeTab === 'utilization' && (
          <div className="space-y-8">

            {/* Bar Chart: Utilization by Department */}
            <div className="bg-slate-50/60 border border-slate-200/60 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Utilization by Department</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Allocated assets per department</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{background:'#6366f1'}}></span>Allocated</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{background:'#14b8a6'}}></span>Available</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{background:'#f97316'}}></span>In Repair</span>
                </div>
              </div>

              {deptChartData.length > 0 ? (
                <div className="overflow-x-auto">
                  <svg
                    width={Math.max(deptChartData.length * 100 + 40, 400)}
                    height={220}
                    style={{ minWidth: '100%' }}
                  >
                    {(() => {
                      const maxV = Math.max(...deptChartData.map((d) => d.total), 1);
                      const groupW = 90;
                      const barW = 20;
                      const chartH = 160;
                      const padTop = 20;
                      const padBot = 40;

                      return deptChartData.map((dept, idx) => {
                        const x0 = idx * groupW + 20;
                        const colors = ['#6366f1', '#14b8a6', '#f97316'];
                        const vals = [dept.allocated, dept.available, dept.inMaintenance];

                        return (
                          <g key={idx}>
                            {/* Grid line */}
                            <line x1={x0 - 4} y1={padTop} x2={x0 - 4} y2={padTop + chartH} stroke="#e2e8f0" strokeWidth="1" />

                            {vals.map((val, bIdx) => {
                              const h = Math.max((val / maxV) * chartH, val > 0 ? 3 : 0);
                              const bx = x0 + bIdx * (barW + 2);
                              const by = padTop + chartH - h;
                              return (
                                <g key={bIdx}>
                                  <rect x={bx} y={by} width={barW} height={h} rx="3" fill={colors[bIdx]} opacity="0.85" />
                                  {val > 0 && (
                                    <text x={bx + barW / 2} y={by - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">
                                      {val}
                                    </text>
                                  )}
                                </g>
                              );
                            })}

                            {/* Dept name */}
                            <text
                              x={x0 + barW + 2}
                              y={padTop + chartH + 14}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#64748b"
                              fontWeight="600"
                            >
                              {(dept.label || '').slice(0, 12)}
                            </text>
                          </g>
                        );
                      });
                    })()}

                    {/* Y axis labels */}
                    {[0, 0.5, 1].map((f) => {
                      const maxV = Math.max(...deptChartData.map((d) => d.total), 1);
                      const y = 20 + 160 - f * 160;
                      return (
                        <text key={f} x={2} y={y + 3} fontSize="9" fill="#94a3b8">
                          {Math.round(f * maxV)}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">No department data</div>
              )}
            </div>

            {/* Table below chart */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3 text-center">Total</th>
                    <th className="px-6 py-3 text-center">Allocated</th>
                    <th className="px-6 py-3 text-center">In Repair</th>
                    <th className="px-6 py-3 text-center">Available</th>
                    <th className="px-6 py-3 text-center">Utilization %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {deptSummary.map((d) => {
                    const util = d.total > 0 ? Math.round(((d.allocated + d.inMaintenance) / d.total) * 100) : 0;
                    return (
                      <tr key={d._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-slate-800">{d.department?.name || 'Common Pool'}</td>
                        <td className="px-6 py-4 font-semibold text-slate-500 uppercase">{d.department?.code || '—'}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-700">{d.total}</td>
                        <td className="px-6 py-4 text-center text-indigo-600 font-semibold">{d.allocated}</td>
                        <td className="px-6 py-4 text-center text-orange-600 font-semibold">{d.inMaintenance}</td>
                        <td className="px-6 py-4 text-center text-emerald-600 font-semibold">{d.available}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-500"
                                style={{ width: `${util}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{util}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {deptSummary.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-400 text-xs">No department data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── MAINTENANCE TAB ── */}
        {activeTab === 'maintenance' && (
          <div className="space-y-8">

            {/* Two charts side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Bar chart: by asset */}
              <div className="bg-slate-50/60 border border-slate-200/60 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Maintenance Frequency by Asset</h4>
                <p className="text-xs text-slate-400 mb-4">Number of repair tickets per asset</p>
                <BarChart
                  data={assetFreqData}
                  valueKey="count"
                  labelKey="label"
                  color="#f43f5e"
                  height={180}
                />
              </div>

              {/* Horiz bar chart: by category */}
              <div className="bg-slate-50/60 border border-slate-200/60 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Repair Frequency by Category</h4>
                <p className="text-xs text-slate-400 mb-4">Which asset categories break down most</p>
                <HorizBarChart
                  data={categoryFreqData}
                  valueKey="count"
                  labelKey="label"
                  color="#8b5cf6"
                />
              </div>
            </div>

            {/* Maintenance cost breakdown table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">All Maintenance Tickets</h4>
                <span className="text-xs font-bold text-slate-500">Total Cost: <span className="text-rose-600">${maintReport?.totalCost?.toLocaleString() ?? 0}</span></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-5 py-3">Asset</th>
                      <th className="px-5 py-3">Title</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Priority</th>
                      <th className="px-5 py-3 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {maintReport?.records?.slice(0, 10).map((m) => (
                      <tr key={m._id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-bold text-slate-800 text-xs">{m.asset?.assetTag || '—'}</td>
                        <td className="px-5 py-3 font-medium text-slate-700">{m.title}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : m.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : m.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {m.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-700">
                          {m.actualCost != null ? `$${m.actualCost}` : '—'}
                        </td>
                      </tr>
                    ))}
                    {(!maintReport?.records || maintReport.records.length === 0) && (
                      <tr>
                        <td colSpan="5" className="px-5 py-10 text-center text-slate-400 text-xs">No maintenance records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── RETIREMENT TAB ── */}
        {activeTab === 'retirement' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Hardware assets with warranties expiring in 90 days</h3>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-3">Asset Tag</th>
                    <th className="px-6 py-3">Asset Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Warranty Expiry</th>
                    <th className="px-6 py-3">Department</th>
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
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs">No assets due for retirement or warranty alert.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── OVERDUE TAB ── */}
        {activeTab === 'overdue' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Active allocations past their checkout return date</h3>
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
                      <td className="px-6 py-4 font-black text-rose-700">
                        <span className="inline-flex items-center gap-1 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          {a.daysOverdue} Days
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!overdueData?.allocations || overdueData.allocations.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-xs">No overdue asset returns registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EXPORT TAB ── */}
        {activeTab === 'export' && (
          <div className="space-y-5 max-w-md">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Export Inventory Registers</h3>
              <p className="text-slate-500 text-xs mt-0.5">Download full dataset registries in JSON format for external reporting.</p>
            </div>

            <div>
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
              className="w-full px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {exportLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Export...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
