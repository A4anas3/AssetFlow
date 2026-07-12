import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/notifications?limit=100');
      setNotifications(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
      alert('Failed to mark notifications as read.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete notification.');
    }
  };

  const getModuleColor = (type) => {
    switch (type) {
      case 'audit': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'transfer': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'maintenance': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'allocation': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getModuleLink = (type, linkedId) => {
    if (!linkedId) return null;
    switch (type) {
      case 'audit': return `/audits/${linkedId}`;
      case 'transfer': return `/transfers/${linkedId}`;
      case 'maintenance': return `/maintenance/${linkedId}`;
      case 'allocation': return `/allocations/${linkedId}`;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inbox Notifications</h2>
          <p className="text-slate-500 text-sm mt-0.5">Real-time alerts for allocations, repairs, transfers, and audits.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Mark All Read
          </button>
        )}
      </div>

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
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-350 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="font-semibold text-sm">Your notifications inbox is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => {
            const link = getModuleLink(notif.type, notif.linkedId);
            return (
              <div
                key={notif._id}
                className={`bg-white border border-slate-200/65 rounded-2xl p-4 shadow-xs flex justify-between items-start gap-4 transition-all duration-200 relative overflow-hidden group hover:border-slate-300 ${
                  !notif.isRead ? 'border-l-4 border-l-teal-500' : ''
                }`}
              >
                <div className="flex gap-3">
                  <span className={`h-8 w-8 rounded-lg border flex items-center justify-center font-bold text-xs uppercase shrink-0 ${getModuleColor(notif.type)}`}>
                    {notif.type?.charAt(0) || 'N'}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-800">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {link && (
                    <Link
                      to={link}
                      onClick={() => handleMarkRead(notif._id)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-bold shadow-xs transition-colors"
                    >
                      View
                    </Link>
                  )}
                  
                  {!notif.isRead && !link && (
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer"
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
