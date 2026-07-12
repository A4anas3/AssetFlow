import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user: authUser } = useAuth();
  const role = authUser?.role;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, kpisRes, overdueRes, activitiesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/kpis'),
        api.get('/dashboard/overdue-allocations'),
        api.get('/dashboard/recent-activities')
      ]);

      setStats(statsRes.data.data);
      setKpis(kpisRes.data.data);
      setOverdue(overdueRes.data.data.allocations || []);
      setRecentActivities(activitiesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <svg className="animate-spin h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 font-semibold text-sm">Loading dashboard statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl max-w-2xl mx-auto mt-10">
        <p className="font-bold">Error</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  // Dashboard Stats Config
  const statsConfig = [
    {
      label: 'Available Assets',
      value: stats?.availableAssets || 0,
      icon: (
        <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-emerald-50',
      border: 'border-emerald-100/80',
    },
    {
      label: 'Allocated Assets',
      value: stats?.allocatedAssets || 0,
      icon: (
        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bg: 'bg-indigo-50',
      border: 'border-indigo-100/80',
    },
    {
      label: 'Maintenance Today',
      value: stats?.maintenanceToday || 0,
      icon: (
        <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-amber-50',
      border: 'border-amber-100/80',
    },
    {
      label: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: (
        <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bg: 'bg-teal-50',
      border: 'border-teal-100/80',
    },
    {
      label: 'Pending Transfers',
      value: stats?.pendingTransfers || 0,
      icon: (
        <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
        </svg>
      ),
      bg: 'bg-cyan-50',
      border: 'border-cyan-100/80',
    },
    {
      label: 'Upcoming Returns',
      value: stats?.upcomingReturns || 0,
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-blue-50',
      border: 'border-blue-100/80',
    },
    {
      label: 'Overdue Returns',
      value: stats?.overdueReturns || 0,
      icon: (
        <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-rose-50',
      border: 'border-rose-100/80',
      highlight: stats?.overdueReturns > 0,
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Upper Welcoming Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Operational Snapshot</h2>
          <p className="text-slate-500 text-sm mt-1">Here is a real-time status overview of the organization's assets and booking requests.</p>
        </div>
        <div className="flex items-center gap-3">
          {['admin', 'asset_manager'].includes(role) && (
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
          <button
            onClick={() => navigate('/bookings/create')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Resource
          </button>
          <button
            onClick={() => navigate('/maintenance/create')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Raise Maintenance
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white border rounded-2xl p-5 shadow-sm shadow-slate-100/30 flex items-center justify-between transition-all duration-300 hover:shadow-md ${
              card.highlight ? 'ring-2 ring-rose-500/10 border-rose-300' : 'border-slate-200/60'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <p className="text-3xl font-black text-slate-800">{card.value}</p>
            </div>
            <div className={`h-12 w-12 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center shadow-sm`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Key performance indicator metrics (resolution rates, utilization) */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Asset Utilization Rate</h4>
              <p className="text-slate-500 text-xs">Percentage of assets currently allocated or in maintenance</p>
              <div className="pt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-800">{kpis.utilizationRate}%</span>
                <span className="text-slate-400 text-xs font-medium">({kpis.utilizedAssets} / {kpis.totalAssets} assets)</span>
              </div>
            </div>
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" />
                <circle cx="32" cy="32" r="28" className="text-teal-500" strokeWidth="6" strokeDasharray={176} strokeDashoffset={176 - (176 * kpis.utilizationRate) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-600">{Math.round(kpis.utilizationRate)}%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Maintenance Resolution Rate</h4>
              <p className="text-slate-500 text-xs">Percentage of maintenance jobs resolved successfully</p>
              <div className="pt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-800">{kpis.maintenanceResolutionRate}%</span>
              </div>
            </div>
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="text-slate-100" strokeWidth="6" stroke="currentColor" fill="transparent" />
                <circle cx="32" cy="32" r="28" className="text-indigo-500" strokeWidth="6" strokeDasharray={176} strokeDashoffset={176 - (176 * kpis.maintenanceResolutionRate) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-600">{Math.round(kpis.maintenanceResolutionRate)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overdue Allocations (Left / Middle Span) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                Overdue Returns
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Asset allocations past their Expected Return Date</p>
            </div>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-full border border-rose-100">
              {overdue.length} Action Needed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 space-y-3">
            {overdue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold">All active returns are up to date!</span>
              </div>
            ) : (
              overdue.map((alloc) => (
                <div
                  key={alloc._id}
                  className="p-3.5 bg-rose-50/30 hover:bg-rose-50/50 border border-rose-100 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-tight bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                        {alloc.asset?.assetTag}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{alloc.asset?.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Held by: <span className="font-semibold text-slate-700">{alloc.employee?.user?.name || 'N/A'}</span> ({alloc.employee?.user?.email})
                    </p>
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Due: {new Date(alloc.expectedReturnDate).toLocaleDateString()} ({Math.ceil((new Date() - new Date(alloc.expectedReturnDate)) / (1000 * 60 * 60 * 24))} days overdue)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/allocations/${alloc._id}`}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors shadow-sm text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Logs (Right Column) */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/30 flex flex-col">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Recent Activities</h3>
            <p className="text-xs text-slate-400 mt-0.5">Audit trail of system actions</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 space-y-4 pr-1">
            {recentActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                No recent activity logged
              </div>
            ) : (
              recentActivities.map((act) => (
                <div key={act._id} className="flex gap-3 relative pb-1">
                  <div className="shrink-0 mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {act.actor?.name ? act.actor.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-2">
                      <span className="font-bold text-slate-800">{act.actor?.name || 'System'}</span> {act.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded bg-slate-100 text-slate-500 border border-slate-200/60">
                        {act.module}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
