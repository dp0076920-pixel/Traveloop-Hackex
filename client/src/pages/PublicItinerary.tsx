import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Share2, Copy, Twitter, Loader2, Heart } from 'lucide-react';
import type { Trip } from '../types';
import { getCategoryColor, CATEGORY_ICONS, formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

export default function PublicItinerary() {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/trips/public/${token}`).then(({ data }) => {
      setTrip(data);
      setLikes(data.likes);
    }).finally(() => setLoading(false));
  }, [token]);

  const copyTrip = async () => {
    if (!user) { navigate('/auth'); return; }
    await api.post(`/trips/${trip!.id}/duplicate`);
    toast.success('Trip copied to your account! 🎉');
    navigate('/trips');
  };

  const likeTrip = async () => {
    const { data } = await api.post(`/trips/${trip!.id}/like`);
    setLikes(data.likes);
  };

  const shareUrl = window.location.href;

  const mapPositions = trip?.stops
    .filter((s) => s.city?.lat && s.city?.lng)
    .map((s) => [s.city.lat, s.city.lng] as [number, number]) ?? [];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  if (!trip) return <div className="min-h-screen flex items-center justify-center text-gray-500">Trip not found or not public</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-brand-600 to-purple-600 overflow-hidden">
        {trip.coverImage && <img src={trip.coverImage} className="w-full h-full object-cover opacity-60" alt="" />}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold mb-2">{trip.name}</motion.h1>
          <p className="text-white/80">{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</p>
          {trip.user && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                {trip.user.name[0]}
              </div>
              <span className="text-sm text-white/80">by {trip.user.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={copyTrip} className="btn-primary flex items-center gap-2">
            <Copy size={16} /> Copy This Trip
          </button>
          <button onClick={likeTrip} className="btn-secondary flex items-center gap-2">
            <Heart size={16} className="text-red-500" /> {likes} Likes
          </button>
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); }}
            className="btn-secondary flex items-center gap-2">
            <Share2 size={16} /> Copy Link
          </button>
          <a href={`https://twitter.com/intent/tweet?text=Check out this trip: ${trip.name}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
            <Twitter size={16} /> Tweet
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this trip: ${trip.name} ${shareUrl}`)}`}
            target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-green-600">
            📱 WhatsApp
          </a>
        </div>

        {/* Map */}
        {mapPositions.length > 0 && (
          <div className="card overflow-hidden">
            <div className="h-56">
              <MapContainer center={mapPositions[0]} zoom={3} className="h-full w-full" scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {mapPositions.length > 1 && <Polyline positions={mapPositions} pathOptions={{ color: '#6366f1', weight: 2, dashArray: '8 6' }} />}
                {trip.stops.map((stop) => stop.city?.lat && (
                  <Marker key={stop.id} position={[stop.city.lat, stop.city.lng]}>
                    <Popup>{stop.city.flagEmoji} {stop.city.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Itinerary */}
        <div className="space-y-6">
          {trip.stops.map((stop, i) => (
            <motion.div key={stop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">{i + 1}</div>
                <div>
                  <h2 className="font-bold text-lg">{stop.city?.flagEmoji} {stop.city?.name}</h2>
                  <p className="text-xs text-gray-500">{stop.city?.country} · {formatDate(stop.startDate)} → {formatDate(stop.endDate)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {stop.stopActivities.map((sa) => (
                  <div key={sa.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${getCategoryColor(sa.activity.category)}`}>
                    <span>{CATEGORY_ICONS[sa.activity.category]}</span>
                    <span className="text-sm font-medium flex-1">{sa.activity.name}</span>
                    {sa.activity.costEstimate && <span className="text-xs opacity-75">${sa.activity.costEstimate}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
