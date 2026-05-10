import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '../types';
import { formatDate } from '../lib/utils';
import api from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';

export default function Community() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/trips/feed').then(({ data }) => setTrips(data.trips)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">🌍 Community Trips</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Discover and get inspired by trips from the community</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-3">🌐</div>
          <p className="text-gray-500">No public trips yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/explore/${trip.shareToken}`)}>
              <div className="relative h-44 bg-gradient-to-br from-brand-500 to-purple-600">
                {trip.coverImage
                  ? <img src={trip.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">{trip.stops?.[0]?.city?.flagEmoji || '✈️'}</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  {trip.stops?.slice(0, 3).map((s) => (
                    <span key={s.id} className="text-lg">{s.city?.flagEmoji}</span>
                  ))}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  <Heart size={10} fill="currentColor" className="text-red-400" /> {trip.likes}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate">{trip.name}</h3>
                {trip.user && <p className="text-xs text-gray-500 mt-0.5">by {trip.user.name}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={10} /> {trip.stops?.length || 0} stops</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(trip.startDate)}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400">{trip.stops?.map((s) => s.city?.name).slice(0, 2).join(', ')}</span>
                  <ExternalLink size={14} className="text-brand-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
