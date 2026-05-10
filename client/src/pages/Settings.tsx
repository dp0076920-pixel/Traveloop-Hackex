import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Trash2, Upload, Loader2, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', language: user?.language || 'en', avatarUrl: user?.avatarUrl || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/profile', profile);
      setUser({ ...user!, ...data });
      toast.success('Profile updated!');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPass(true);
    try {
      await api.patch('/auth/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } finally {
      setChangingPass(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    await api.delete('/auth/account');
    await logout();
    navigate('/auth');
    toast.success('Account deleted');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={20} className="text-brand-600" />
          <h2 className="font-semibold text-lg">Profile</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
              <Upload size={14} /> Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Full Name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input className="input opacity-60" value={user?.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Language</label>
            <select className="input" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="ja">🇯🇵 Japanese</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <Lock size={20} className="text-brand-600" />
          <h2 className="font-semibold text-lg">Change Password</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium block mb-1">{label}</label>
              <input type="password" className="input" value={passwords[key as keyof typeof passwords]}
                onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} />
            </div>
          ))}
          <button type="submit" disabled={changingPass} className="btn-primary flex items-center gap-2">
            {changingPass ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Update Password
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <motion.div className="card p-6 border-red-200 dark:border-red-900">
        <div className="flex items-center gap-3 mb-3">
          <Trash2 size={20} className="text-red-500" />
          <h2 className="font-semibold text-lg text-red-600">Danger Zone</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button onClick={deleteAccount} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm">
          Delete Account
        </button>
      </motion.div>
    </div>
  );
}
