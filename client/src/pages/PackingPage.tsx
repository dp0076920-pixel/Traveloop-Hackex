import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, Loader2, CheckCircle2, Circle } from 'lucide-react';
import type { PackingItem } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['documents', 'clothing', 'electronics', 'toiletries', 'misc'];
const CAT_ICONS: Record<string, string> = { documents: '📄', clothing: '👕', electronics: '💻', toiletries: '🧴', misc: '🎒' };

export default function PackingPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', category: 'misc' });
  const [activeCategory, setActiveCategory] = useState('all');

  const load = async () => {
    const { data } = await api.get(`/trips/${id}/packing`);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post(`/trips/${id}/packing/generate`);
      setItems(data);
      toast.success('Smart packing list generated! ✨');
    } finally {
      setGenerating(false);
    }
  };

  const toggle = async (item: PackingItem) => {
    const { data } = await api.patch(`/trips/${id}/packing/${item.id}/toggle`);
    setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)));
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.label.trim()) return;
    const { data } = await api.post(`/trips/${id}/packing`, newItem);
    setItems((prev) => [...prev, data]);
    setNewItem({ label: '', category: 'misc' });
  };

  const deleteItem = async (itemId: string) => {
    await api.delete(`/trips/${id}/packing/${itemId}`);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);
  const packed = items.filter((i) => i.isPacked).length;
  const pct = items.length > 0 ? (packed / items.length) * 100 : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Packing Checklist</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{packed} of {items.length} items packed</p>
        </div>
        <button onClick={generate} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
          {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          Smart Generate
        </button>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Packing Progress</span>
          <span className="text-sm font-semibold text-brand-600">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
        {pct === 100 && items.length > 0 && (
          <p className="text-green-600 text-sm font-medium mt-2 text-center">🎉 All packed! Ready to go!</p>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
          All ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {CAT_ICONS[cat]} {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🎒</div>
          <p className="text-gray-500 mb-4">No items yet. Generate a smart list or add manually!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${item.isPacked ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
                onClick={() => toggle(item)}>
                {item.isPacked
                  ? <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                  : <Circle size={20} className="text-gray-300 flex-shrink-0" />}
                <span className="text-lg">{CAT_ICONS[item.category]}</span>
                <span className={`flex-1 text-sm font-medium ${item.isPacked ? 'line-through text-gray-400' : ''}`}>{item.label}</span>
                <span className="text-xs text-gray-400 capitalize">{item.category}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add item */}
      <form onSubmit={addItem} className="card p-4 flex gap-3">
        <select className="input w-auto text-sm" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
        <input className="input flex-1 text-sm" placeholder="Add item..." value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} />
        <button type="submit" className="btn-primary px-3"><Plus size={16} /></button>
      </form>
    </div>
  );
}
