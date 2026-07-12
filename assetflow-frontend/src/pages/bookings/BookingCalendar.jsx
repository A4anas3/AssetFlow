import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const BookingCalendar = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/bookings?limit=100');
      setBookings(response.data.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookings for calendar.');
    } finally {
      setLoading(false);
    }
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce((groups, booking) => {
    const dateStr = new Date(booking.startTime).toDateString();
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(booking);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedBookings).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Booking Calendar</h2>
          <p className="text-slate-500 text-sm mt-0.5">Timeline schedule of room and equipment bookings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            List View
          </button>
          <button
            onClick={() => navigate('/bookings/create')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-teal-600/10 cursor-pointer"
          >
            Reserve Slot
          </button>
        </div>
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
      ) : sortedDates.length === 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <svg className="h-12 w-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
          </svg>
          <p className="font-semibold text-sm">No bookings scheduled yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => (
            <div key={dateStr} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">{dateStr}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {groupedBookings[dateStr].map((book) => (
                  <div
                    key={book._id}
                    className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs hover:border-slate-350 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wide">
                          {book.resource?.assetTag}
                        </span>
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          book.status === 'upcoming' ? 'bg-indigo-500' : book.status === 'ongoing' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`} />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-800 mt-2 truncate">{book.purpose}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Resource: {book.resource?.name}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                      <span>{new Date(book.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(book.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="truncate max-w-[80px]">By: {book.bookedBy?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
