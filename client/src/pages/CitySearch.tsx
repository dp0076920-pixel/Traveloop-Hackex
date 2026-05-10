import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useCities, useDebounce } from '../hooks';
import { CityCard } from '../components/CityCard';
import { CityCardSkeleton } from '../components/ui/Skeleton';
import type { City } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const COST_LEVELS = [{ label: '💚 Budget', value: 'budget' }, { label: '💛 Mid-range', value: 'mid' }, { label: '💜 Luxury', value: 'luxury' }];

function AddToTripModal({ city, onClose }: { city: City; onClose: () => void }) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadTrips = async () => {
    const { data } = await api.get('/trips', { params: { limit: 50 } });
    setTrips(data.trips);
    setLoaded(true);
  };

  useState(() => { loadTrips(); });

  const addToTrip = async (tripId: string) => {
    await api.post(`/trips/${tripId}/stops`, { cityId: city.id });
    toast.success(`${city.name} added to trip!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-1">Add {city.flagEmoji} {city.name} to...</h3>
        <p className="text-sm text-gray-500 mb-4">Select a trip</p>
        {!loaded ? <p className="text-center text-gray-400 py-4">Loading...</p> : trips.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No trips yet. Create one first!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trips.map((t) => (
              <button key={t.id} onClick={() => addToTrip(t.id)}
                className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">{t.stops?.length || 0} stops</p>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CitySearch() {
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('');
  const [costIndex, setCostIndex] = useState('');
  const [addingCity, setAddingCity] = useState<City | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const params: Record<string, string> = {};
  if (debouncedSearch) params.q = debouncedSearch;
  if (continent) params.continent = continent;
  if (costIndex) params.costIndex = costIndex;

  const { cities, loading, total } = useCities(params);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Explore Cities</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} cities available</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-11 text-base" placeholder="Search cities or countries..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={16} className="text-gray-400" />
        <select className="input w-auto text-sm py-1.5" value={continent} onChange={(e) => setContinent(e.target.value)}>
          <option value="">All Continents</option>
          {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          {COST_LEVELS.map((cl) => (
            <button key={cl.value} onClick={() => setCostIndex(costIndex === cl.value ? '' : cl.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${costIndex === cl.value ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {cl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <CityCardSkeleton key={i} />)}
        </div>
      ) : cities.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">No cities found. Try different filters.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city, i) => (
            <motion.div key={city.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <CityCard city={city} onAddToTrip={() => setAddingCity(city)} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {addingCity && <AddToTripModal city={addingCity} onClose={() => setAddingCity(null)} />}
    </div>
  );
}
