import { motion } from 'framer-motion';
import { Star, DollarSign, Bookmark } from 'lucide-react';
import type { City } from '../types';
import { cn } from '../lib/utils';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface Props {
  city: City;
  onAddToTrip?: (city: City) => void;
  bookmarked?: boolean;
}

const COST_STYLES = {
  budget: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  mid: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  luxury: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export const CityCard = ({ city, onAddToTrip, bookmarked: initialBookmarked }: Props) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked ?? false);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/cities/${city.id}/bookmark`);
      setBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? 'City saved!' : 'Removed from saved');
    } catch { /* handled by interceptor */ }
  };

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className="card overflow-hidden group">
      <div className="relative h-36 bg-gradient-to-br from-blue-400 to-teal-500 overflow-hidden">
        {city.imageUrl ? (
          <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">{city.flagEmoji || '🌍'}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button onClick={toggleBookmark}
          className={cn('absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors',
            bookmarked ? 'bg-yellow-400 text-white' : 'bg-white/20 text-white hover:bg-white/40')}>
          <Bookmark size={14} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
        <span className={cn('badge absolute bottom-2 left-2', COST_STYLES[city.costIndex])}>
          {city.costIndex}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">{city.flagEmoji} {city.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{city.country} · {city.continent}</p>
          </div>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star size={11} fill="currentColor" />
            <span className="text-xs text-gray-600 dark:text-gray-400">{city.popularityScore.toFixed(1)}</span>
          </div>
        </div>
        {city.avgDailyCost && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-0.5">
            <DollarSign size={10} /> ~${city.avgDailyCost}/day
          </p>
        )}
        {onAddToTrip && (
          <button onClick={() => onAddToTrip(city)}
            className="mt-2 w-full btn-primary text-xs py-1.5">
            + Add to Trip
          </button>
        )}
      </div>
    </motion.div>
  );
};
