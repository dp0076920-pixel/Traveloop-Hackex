import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, Globe, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTrips, useCities } from '../hooks';
import { TripCard } from '../components/TripCard';
import { CityCard } from '../components/CityCard';
import { TripCardSkeleton, CityCardSkeleton } from '../components/ui/Skeleton';
import { getTripStatus } from '../lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const greetings = ['Good morning', 'Good afternoon', 'Good evening'];
const getGreeting = () => greetings[Math.min(2, Math.floor(new Date().getHours() / 8))];

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { trips, loading: tripsLoading, refetch } = useTrips();
  const { cities: trending, loading: citiesLoading } = useCities({ limit: '8' });
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { setTimeout(() => setMapReady(true), 100); }, []);

  const upcoming = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'upcoming');
  const allStops = trips.flatMap((t) => t.stops || []);
  const uniqueCountries = new Set(allStops.map((s) => s.city?.country)).size;
  const totalDays = trips.reduce((acc, t) => {
    if (!t.startDate || !t.endDate) return acc;
    return acc + Math.ceil((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000);
  }, 0);

  const mapPins = allStops.filter((s) => s.city?.lat && s.city?.lng);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Where are you headed next?</p>
        </div>
        <button onClick={() => navigate('/trips/new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Trip
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Map, label: 'Total Trips', value: trips.length, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
          { icon: Globe, label: 'Countries', value: uniqueCountries, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { icon: Calendar, label: 'Days Traveled', value: totalDays, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { icon: TrendingUp, label: 'Upcoming', value: upcoming.length, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* World Map */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><Globe size={18} /> Your Travel Map</h2>
        </div>
        <div className="h-64 md:h-80">
          {mapReady && (
            <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              {mapPins.map((stop) => (
                <Marker key={stop.id} position={[stop.city.lat, stop.city.lng]}>
                  <Popup>
                    <div className="text-sm font-semibold">{stop.city.flagEmoji} {stop.city.name}</div>
                    <div className="text-xs text-gray-500">{stop.city.country}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Upcoming Trips</h2>
          <button onClick={() => navigate('/trips')} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</button>
        </div>
        {tripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <TripCardSkeleton key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-3">✈️</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No upcoming trips yet</p>
            <button onClick={() => navigate('/trips/new')} className="btn-primary">Plan your first trip</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.slice(0, 3).map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={refetch} onDuplicate={refetch} />
            ))}
          </div>
        )}
      </div>

      {/* Trending Destinations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">🔥 Trending Destinations</h2>
          <button onClick={() => navigate('/cities')} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">Explore all</button>
        </div>
        {citiesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <CityCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending.map((city) => (
              <CityCard key={city.id} city={city} onAddToTrip={() => navigate('/trips/new')} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
