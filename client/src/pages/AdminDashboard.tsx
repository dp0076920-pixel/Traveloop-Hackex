import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Map, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadStats = async () => {
    const [statsRes, usersRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users', { params: { limit: 20 } }),
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data.users);
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const loadUsers = async () => {
    const { data } = await api.get('/admin/users', { params: { q: search, limit: 20 } });
    setUsers(data.users);
  };

  const deleteTrip = async (tripId: string) => {
    if (!confirm('Delete this trip?')) return;
    await api.delete(`/admin/trips/${tripId}`);
    toast.success('Trip deleted');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;

  const chartData = stats?.topCities?.map((tc: any) => ({
    name: tc.city?.name || 'Unknown',
    trips: tc._count?.cityId || 0,
  })) ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: stats?.totalUsers, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
          { icon: Map, label: 'Total Trips', value: stats?.totalTrips, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { icon: TrendingUp, label: 'Trips This Week', value: stats?.tripsThisWeek, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Cities Chart */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4">Top 10 Cities by Usage</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
            <Tooltip />
            <Bar dataKey="trips" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Users Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Users</h2>
          <div className="flex gap-2">
            <input className="input text-sm py-1.5 w-48" placeholder="Search users..." value={search}
              onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadUsers()} />
            <button onClick={loadUsers} className="btn-primary text-sm py-1.5 px-3">Search</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Name', 'Email', 'Trips', 'Joined', 'Admin', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="py-2.5 px-3 font-medium">{u.name}</td>
                  <td className="py-2.5 px-3 text-gray-500">{u.email}</td>
                  <td className="py-2.5 px-3">{u._count?.trips || 0}</td>
                  <td className="py-2.5 px-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3">{u.isAdmin ? '✅' : '—'}</td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => deleteTrip(u.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
