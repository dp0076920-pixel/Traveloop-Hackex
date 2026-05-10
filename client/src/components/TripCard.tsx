import { motion } from 'framer-motion';
import { Calendar, MapPin, Trash2, Edit, Copy, Share2, Globe } from 'lucide-react';
import type { Trip } from '../types';
import { getTripStatus, getDaysUntil, formatDate, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Props {
  trip: Trip;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const STATUS_STYLES = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const TripCard = ({ trip, onDelete, onDuplicate }: Props) => {
  const navigate = useNavigate();
  const status = getTripStatus(trip.startDate, trip.endDate);
  const daysUntil = getDaysUntil(trip.startDate);
  const cities = trip.stops?.map((s) => s.city?.name).filter(Boolean).slice(0, 3).join(', ');

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this trip?')) return;
    await api.delete(`/trips/${trip.id}`);
    toast.success('Trip deleted');
    onDelete?.();
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.post(`/trips/${trip.id}/duplicate`);
    toast.success('Trip duplicated!');
    onDuplicate?.();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trip.shareToken) {
      await navigator.clipboard.writeText(`${window.location.origin}/explore/${trip.shareToken}`);
      toast.success('Link copied!');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      <div className="relative h-44 bg-gradient-to-br from-brand-500 to-purple-600 overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {trip.stops?.[0]?.city?.flagEmoji || '✈️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className={cn('badge absolute top-3 left-3', STATUS_STYLES[status])}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {trip.isPublic && (
          <span className="badge absolute top-3 right-3 bg-white/20 text-white backdrop-blur-sm">
            <Globe size={10} /> Public
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{trip.name}</h3>
        {cities && (
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <MapPin size={12} /> {cities}{trip.stops?.length > 3 ? ` +${trip.stops.length - 3} more` : ''}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={12} />
          <span>{formatDate(trip.startDate)} {trip.endDate ? `→ ${formatDate(trip.endDate)}` : ''}</span>
        </div>
        {status === 'upcoming' && daysUntil !== null && daysUntil >= 0 && (
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-2">
            🗓️ {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} away`}
          </p>
        )}
        {trip.totalBudget && (
          <p className="text-xs text-gray-500 mt-1">💰 Budget: ${trip.totalBudget.toLocaleString()}</p>
        )}

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}/builder`); }}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-brand-600 transition-colors py-1">
            <Edit size={12} /> Edit
          </button>
          <button onClick={handleDuplicate}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors py-1">
            <Copy size={12} /> Copy
          </button>
          <button onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors py-1">
            <Share2 size={12} /> Share
          </button>
          <button onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors py-1">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};
