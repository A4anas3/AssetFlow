import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit profile info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);

  // Change password info
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/profile');
      const data = response.data.data;
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/profile', { name, email });
      setSuccess('Profile updated successfully.');
      setProfile(response.data.data);
      
      // Update local storage / auth context user info
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, name, email }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.patch('/profile/password', {
        currentPassword,
        newPassword
      });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setAvatarLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.patch('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(response.data.data);
      setSuccess('Avatar image updated.');
      
      // Sync local storage user
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...parsed, avatar: response.data.data.avatar }));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarLoading(false);
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
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* Profile Overview Card */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 text-center space-y-4">
          
          {/* Avatar display */}
          <div className="relative inline-block group">
            <div className="h-24 w-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-3xl shadow-sm">
              {profile?.avatar ? (
                <img src={`${api.defaults.baseURL.replace('/api', '')}${profile.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                profile?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-teal-600 border-2 border-white hover:bg-teal-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarLoading}
              />
            </label>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-805">{profile?.name}</h3>
            <span className="inline-block px-2.5 py-0.5 mt-1 rounded bg-slate-100 border border-slate-205 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              {profile?.role}
            </span>
          </div>

          <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-1">
            <span className="block truncate">{profile?.email}</span>
            {profile?.department && (
              <span className="block font-bold text-slate-600 mt-1">Dept: {profile.department.name} ({profile.department.code})</span>
            )}
          </div>

        </div>
      </div>

      {/* Edit Details Forms */}
      <div className="md:col-span-2 space-y-6">
        
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-605 text-sm font-semibold">
            {success}
          </div>
        )}

        {/* General Info */}
        <form onSubmit={handleInfoSubmit} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Profile Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={infoLoading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10 cursor-pointer"
            >
              {infoLoading ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/10 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Change Password</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-xs"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-xs"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-teal-500 transition-all text-xs"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};

export default Profile;
