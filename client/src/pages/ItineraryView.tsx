import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { List, Calendar, Printer, Share2, Loader2 } from 'lucide-react';
import { useTripData } from '../hooks';
import { getCategoryColor, CATEGORY_ICONS, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

export default function ItineraryView() {
  const { id } = useParams<{ id: string }>();
  const { trip, loading } = useTripData(id);
  const [view, setView] = useState<'timeline' | 'calendar'>('timeline');

  const copyShareLink = async () => {
    if (!trip?.shareToken) return;
    await navigator.clipboard.writeText(`${window.location.origin}/explore/${trip.shareToken}`);
    toast.success('Share link copied!');
  };

  const mapPositions = trip?.stops
    .filter((s) => s.city?.lat && s.city?.lng)
    .map((s) => [s.city.lat, s.city.lng] as [number, number]) ?? [];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  if (!trip) return <div className="text-center py-16 text-gray-500">Trip not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(trip.startDate)} → {formatDate(trip.endDate)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer size={15} /> Print
          </button>
          <button onClick={copyShareLink} className="btn-secondary flex items-center gap-2 text-sm">
            <Share2 size={15} /> Share
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['timeline', 'calendar'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>
            {v === 'timeline' ? <List size={15} /> : <Calendar size={15} />}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Animated Route Map */}
      {mapPositions.length > 1 && (
        <div className="card overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800 text-sm font-medium">🗺️ Route Map</div>
          <div className="h-56">
            <MapContainer bounds={mapPositions.length > 0 ? mapPositions : undefined} center={mapPositions[0] || [20, 0]} zoom={4} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={mapPositions} pathOptions={{ color: '#6366f1', weight: 2, dashArray: '8 6' }} />
              {trip.stops.map((stop, i) => stop.city?.lat && (
                <Marker key={stop.id} position={[stop.city.lat, stop.city.lng]}>
                  <Popup><strong>{i + 1}. {stop.city.flagEmoji} {stop.city.name}</strong></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {view === 'timeline' && (
        <div className="space-y-6">
          {trip.stops.map((stop, stopIdx) => (
            <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: stopIdx * 0.1 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">{stopIdx + 1}</div>
                <div>
                  <h2 className="font-bold text-lg">{stop.city?.flagEmoji} {stop.city?.name}</h2>
                  <p className="text-xs text-gray-500">{formatDate(stop.startDate)} → {formatDate(stop.endDate)}</p>
                </div>
              </div>
              <div className="ml-11 space-y-2">
                {stop.stopActivities.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No activities planned</p>
                ) : (
                  stop.stopActivities.map((sa) => (
                    <div key={sa.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 bg-gray-50 dark:bg-gray-800/50 ${getCategoryColor(sa.activity.category).replace('bg-', 'border-').split(' ')[0]}`}>
                      <span className="text-xl">{CATEGORY_ICONS[sa.activity.category] || '🎯'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{sa.activity.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {sa.scheduledTime && <span>⏰ {sa.scheduledTime}</span>}
                          {sa.activity.durationHours && <span>⏱ {sa.activity.durationHours}h</span>}
                          {(sa.customCost ?? sa.activity.costEstimate) && <span>💰 ${sa.customCost ?? sa.activity.costEstimate}</span>}
                        </div>
                      </div>
                      <span className={`badge text-xs ${getCategoryColor(sa.activity.category)}`}>{sa.activity.category}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trip.stops.map((stop) => (
            <div key={stop.id} className="card p-4">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-2xl">{stop.city?.flagEmoji}</span>
                <div>
                  <h3 className="font-semibold">{stop.city?.name}</h3>
                  <p className="text-xs text-gray-500">{formatDate(stop.startDate)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {stop.stopActivities.map((sa) => (
                  <div key={sa.id} className={`p-2 rounded-lg text-xs ${getCategoryColor(sa.activity.category)}`}>
                    <p className="font-medium">{CATEGORY_ICONS[sa.activity.category]} {sa.activity.name}</p>
                    {sa.activity.costEstimate && <p className="opacity-75 mt-0.5">${sa.activity.costEstimate}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
