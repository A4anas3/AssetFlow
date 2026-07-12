import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      // filter unread
      const dataArray = Array.isArray(response.data.data) ? response.data.data : (response.data.data?.data || []);
      const unread = dataArray.filter(n => !n.isRead);
      setNotifications(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to read all notifications:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      logout();
      navigate('/login');
    }
  };

  // Nav Item configuration based on role
  const getNavItems = () => {
    const role = user?.role;
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      )},
      { path: '/assets', label: 'Assets Catalog', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )},
      { path: '/bookings', label: 'Resource Bookings', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )},
      { path: '/maintenance', label: 'Maintenance', icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    ];

    // Admin & Asset Manager only items
    if (['admin', 'asset_manager'].includes(role)) {
      items.push(
        { path: '/allocations', label: 'Allocations', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
          </svg>
        )},
        { path: '/transfers', label: 'Transfers', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )},
        { path: '/audits', label: 'Audits', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )},
        { path: '/reports', label: 'Reports & Analytics', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9-1v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        )}
      );
    }

    // Admin only items
    if (role === 'admin') {
      items.push(
        { path: '/organization/departments', label: 'Departments Setup', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )},
        { path: '/organization/categories', label: 'Categories Setup', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )},
        { path: '/organization/employees', label: 'Employee Directory', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )},
        { path: '/activity-logs', label: 'System Logs', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )},
        { path: '/settings', label: 'System Settings', icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        )}
      );
    }

    return items;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'asset_manager': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'department_head': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-teal-50 text-teal-700 border-teal-100';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'asset_manager': return 'Asset Manager';
      case 'department_head': return 'Dept Head';
      default: return 'Employee';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-700">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200/60 flex flex-col">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            AssetFlow
          </span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-600 border border-teal-100">
            ERP
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {getNavItems().map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/10 to-indigo-500/5 text-teal-600 border border-teal-500/10 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-teal-600 animate-pulse' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(user?.role)}`}>
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200/60 bg-white flex items-center justify-between px-8 z-20 shadow-sm shadow-slate-100/30">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800">
              Welcome, <span className="text-teal-600">{user?.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 transition-colors relative cursor-pointer ${showNotifications ? 'bg-slate-50 text-slate-600' : ''}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold animate-bounce shadow-md">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="font-bold text-sm text-slate-700">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n._id}
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="block p-3.5 hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="inline-block text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                  <div className="p-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user?.name}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile/edit"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    >
                      Edit Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

