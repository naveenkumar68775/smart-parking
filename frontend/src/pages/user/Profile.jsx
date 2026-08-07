import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { userInfo, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: userInfo?.name || '', phone: userInfo?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onPwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', form);
      await refreshProfile();
      Swal.fire({ icon: 'success', title: 'Profile updated', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: err.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.put('/users/change-password', pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      Swal.fire({ icon: 'success', title: 'Password changed', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message });
    } finally {
      setChangingPw(false);
    }
  };

  const uploadAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshProfile();
      Swal.fire({ icon: 'success', title: 'Avatar updated', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload failed', text: err.response?.data?.message });
    } finally {
      setUploading(false);
    }
  };

  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-2xl font-bold">My Profile</h2>

      <div className="card text-center">
        <img
          src={userInfo?.avatar ? `${apiOrigin}${userInfo.avatar}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userInfo?.name || 'U')}
          alt="Avatar"
          className="w-24 h-24 rounded-full mx-auto object-cover border"
        />
        <form onSubmit={uploadAvatar} className="mt-3 flex flex-col items-center gap-2">
          <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => setAvatarFile(e.target.files[0])} />
          <button className="btn-secondary" disabled={uploading} type="submit">
            {uploading ? 'Uploading...' : 'Upload Picture'}
          </button>
        </form>
      </div>

      <form onSubmit={submit} className="card space-y-1">
        <h3 className="font-semibold mb-1">Basic Info</h3>
        <label className="label">Email (read-only)</label>
        <input className="input bg-gray-100 dark:bg-gray-700" value={userInfo?.email || ''} disabled />

        <label className="label">Name</label>
        <input className="input" name="name" value={form.name} onChange={onChange} required />

        <label className="label">Phone</label>
        <input className="input" name="phone" value={form.phone} onChange={onChange} />

        <button className="btn-primary w-full mt-4" disabled={saving} type="submit">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={changePassword} className="card space-y-1">
        <h3 className="font-semibold mb-1">Change Password</h3>
        <label className="label">Current Password</label>
        <input className="input" type="password" name="currentPassword" value={pwForm.currentPassword} onChange={onPwChange} required />

        <label className="label">New Password</label>
        <input className="input" type="password" name="newPassword" value={pwForm.newPassword} onChange={onPwChange} minLength={6} required />

        <button className="btn-primary w-full mt-4" disabled={changingPw} type="submit">
          {changingPw ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
