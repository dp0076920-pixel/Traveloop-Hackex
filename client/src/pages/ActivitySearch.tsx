import { useState } from 'react';
import { motion } from 'framer-motion';
import { useActivities, useDebounce } from '../hooks';
import { ActivityCard } from '../components/ActivityCard';
import { Skeleton } from '../components/ui/Skeleton';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'nightlife', 'shopping', 'wellness'];

export default function ActivitySearch() {
  const [category, setCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const debouncedCost = useDebounce(maxCost, 400);
  const debouncedDuration = useDebounce(maxDuration, 400);

  const params: Record<string, string> = { limit: '40' };
  if (category) params.category = category;
  if (debouncedCost) params.maxCost = debouncedCost;
  if (debouncedDuration) params.maxDuration = debouncedDuration;

  const { activities, loading } = useActivities(params);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Explore Activities</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Discover things to do around the world</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${!category ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(category === c ? '' : c)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${category === c ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-3 ml-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Max $</span>
            <input type="number" className="input pl-12 w-28 text-sm py-1.5" placeholder="Cost" value={maxCost} onChange={(e) => setMaxCost(e.target.value)} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Max</span>
            <input type="number" className="input pl-10 w-28 text-sm py-1.5" placeholder="Hours" value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : activities.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-gray-500">No activities found. Try different filters.</p>
        </div>
      ) : (
        <motion.div layout className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div key={activity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <ActivityCard activity={activity} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
