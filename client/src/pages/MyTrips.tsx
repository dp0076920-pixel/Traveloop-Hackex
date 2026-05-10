import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../hooks';
import { TripCard } from '../components/TripCard';
import { TripCardSkeleton } from '../components/ui/Skeleton';

const FILTERS = [
  { label: 'All', value: '' },
  { label: '🗓️ Upcoming', value: 'upcoming' },
  { label: '🟢 Ongoing', value: 'ongoing' },
  { label: '✅ Completed', value: 'completed' },
];

export default function MyTrips() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { trips, loading, refetch } = useTrips(status || undefined);

  const filtered = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.stops?.some((s) => s.city?.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => navigate('/trips/new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Trip
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search trips or cities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatus(f.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${status === f.value ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-16 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold mb-2">No trips found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start planning your next adventure!</p>
          <button onClick={() => navigate('/trips/new')} className="btn-primary">Create a Trip</button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TripCard trip={trip} onDelete={refetch} onDuplicate={refetch} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
