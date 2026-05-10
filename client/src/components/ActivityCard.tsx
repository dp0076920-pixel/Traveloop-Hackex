import { motion } from 'framer-motion';
import { Clock, DollarSign, Star } from 'lucide-react';
import type { Activity } from '../types';
import { getCategoryColor, CATEGORY_ICONS } from '../lib/utils';

interface Props {
  activity: Activity;
  onAdd?: (activity: Activity) => void;
  onRemove?: () => void;
  added?: boolean;
}

export const ActivityCard = ({ activity, onAdd, onRemove, added }: Props) => (
  <motion.div whileHover={{ y: -2 }} className="card p-3 flex gap-3">
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
      {activity.imageUrl
        ? <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover rounded-xl" />
        : CATEGORY_ICONS[activity.category] || '🎯'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm truncate">{activity.name}</h4>
        <span className={`badge text-xs flex-shrink-0 ${getCategoryColor(activity.category)}`}>
          {activity.category}
        </span>
      </div>
      {activity.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{activity.description}</p>
      )}
      <div className="flex items-center gap-3 mt-1.5">
        {activity.costEstimate !== undefined && (
          <span className="text-xs text-gray-500 flex items-center gap-0.5">
            <DollarSign size={10} />${activity.costEstimate}
          </span>
        )}
        {activity.durationHours && (
          <span className="text-xs text-gray-500 flex items-center gap-0.5">
            <Clock size={10} />{activity.durationHours}h
          </span>
        )}
        {activity.rating && (
          <span className="text-xs text-amber-500 flex items-center gap-0.5">
            <Star size={10} fill="currentColor" />{activity.rating}
          </span>
        )}
      </div>
    </div>
    <div className="flex-shrink-0 flex items-center">
      {added ? (
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          Remove
        </button>
      ) : (
        <button onClick={() => onAdd?.(activity)} className="text-xs text-brand-600 dark:text-brand-400 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
          + Add
        </button>
      )}
    </div>
  </motion.div>
);
