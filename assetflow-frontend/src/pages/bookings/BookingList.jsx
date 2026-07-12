import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const BookingList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/bookings?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;
      const response = await api.get(url);
      setBookings(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = window.prompt('Please specify the reason for cancellation:');
    if (reason === null) return; // cancelled prompt
    
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: reason || 'Cancelled by user' });
      fetchBookings();
      alert('Booking cancelled successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">Upcoming</span>;
      case 'ongoing':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">Ongoing</span>;
      case 'completed':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Completed</span>;
      case 'cancelled':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">Cancelled</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Bookings</h2>
          <p className="text-slate-500 text-sm mt-0.5">Reserve shared meeting rooms, audio-visual kits, vehicles, and desks.</p>
        </div>
        <button
          onClick={() => navigate('/bookings/create')}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Reserve Slot
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm shadow-slate-100/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!statusFilter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All Slots
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'upcoming' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter('ongoing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'ongoing' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Ongoing
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'completed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'cancelled' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Listing */}
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
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
          </svg>
          <p className="font-semibold text-sm">No bookings scheduled yet</p>
          <button
            onClick={() => navigate('/bookings/create')}
            className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
          >
            Schedule a booking slot
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm shadow-slate-100/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Reserved By</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4">End Time</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {bookings.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <div className="space-y-0.5">
                        <Link to={`/assets/${book.resource?._id}`} className="hover:text-teal-600 transition-colors underline block uppercase tracking-tight">
                          {book.resource?.assetTag}
                        </Link>
                        <span className="block text-xs font-medium text-slate-500">{book.resource?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-650">{book.bookedBy?.name || 'User'}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(book.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(book.endTime).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-550 max-w-xs truncate" title={book.purpose}>{book.purpose || 'Meeting'}</td>
                    <td className="px-6 py-4">{getStatusBadge(book.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {['upcoming', 'ongoing'].includes(book.status) && (book.bookedBy?._id === user?._id || ['admin', 'asset_manager'].includes(user?.role)) && (
                        <button
                          onClick={() => handleCancelBooking(book._id)}
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Cancel Slot
                        </button>
                      )}
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

export default BookingList;
