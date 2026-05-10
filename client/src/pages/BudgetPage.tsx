import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useBudget, useTripData } from '../hooks';
import { CATEGORY_ICONS } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';

const COLORS = { transport: '#6366f1', stay: '#8b5cf6', food: '#f59e0b', activity: '#10b981', other: '#6b7280' };
const CATEGORIES = ['transport', 'stay', 'food', 'activity', 'other'];

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const { trip } = useTripData(id);
  const { expenses, loading, total, byCategory, refetch } = useBudget(id);
  const [form, setForm] = useState({ category: 'food', amount: '', label: '', date: new Date().toISOString().split('T')[0] });
  const [adding, setAdding] = useState(false);

  const budget = trip?.totalBudget ?? 0;
  const remaining = budget - total;
  const pct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;

  const donutData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const barData = expenses.reduce((acc: any[], e) => {
    const date = e.date.split('T')[0];
    const existing = acc.find((d) => d.date === date);
    if (existing) existing[e.category] = (existing[e.category] || 0) + e.amount;
    else acc.push({ date, [e.category]: e.amount });
    return acc;
  }, []);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.label) return;
    setAdding(true);
    try {
      await api.post(`/trips/${id}/expenses`, { ...form, amount: parseFloat(form.amount) });
      toast.success('Expense added');
      setForm({ category: 'food', amount: '', label: '', date: new Date().toISOString().split('T')[0] });
      refetch();
    } finally {
      setAdding(false);
    }
  };

  const deleteExpense = async (expId: string) => {
    await api.delete(`/trips/${id}/expenses/${expId}`);
    refetch();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Budget & Expenses</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{trip?.name}</p>
      </div>

      {/* Budget overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Budget', value: `$${budget.toLocaleString()}`, color: 'text-brand-600' },
          { label: 'Spent', value: `$${total.toFixed(2)}`, color: 'text-red-500' },
          { label: 'Remaining', value: `$${remaining.toFixed(2)}`, color: remaining >= 0 ? 'text-green-600' : 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Budget progress */}
      {budget > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget Used</span>
            <span className={`text-sm font-semibold ${pct > 90 ? 'text-red-500' : 'text-gray-600'}`}>{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
          </div>
          {pct > 90 && (
            <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
              <AlertTriangle size={14} /> You're close to your budget limit!
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          {donutData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No expenses yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-4">Daily Spending</h3>
          {barData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No expenses yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                {CATEGORIES.map((cat) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[cat as keyof typeof COLORS]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Add expense */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">Add Expense</h3>
        <form onSubmit={addExpense} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
          <input className="input" placeholder="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input type="number" className="input" placeholder="Amount ($)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <button type="submit" disabled={adding} className="btn-primary col-span-2 md:col-span-4 flex items-center justify-center gap-2">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Expense
          </button>
        </form>
      </div>

      {/* Expense list */}
      <div className="card p-4">
        <h3 className="font-semibold mb-4">All Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No expenses recorded yet</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span className="text-xl">{CATEGORY_ICONS[exp.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{exp.label}</p>
                  <p className="text-xs text-gray-500">{exp.date.split('T')[0]} · {exp.category}</p>
                </div>
                <span className="font-semibold text-sm">${exp.amount.toFixed(2)}</span>
                <button onClick={() => deleteExpense(exp.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
