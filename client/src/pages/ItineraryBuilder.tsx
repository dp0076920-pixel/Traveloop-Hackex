import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, ChevronDown, ChevronUp, Trash2, Sparkles, Loader2, MapPin, X } from 'lucide-react';
import { useTripData, useCities, useActivities } from '../hooks';
import { ActivityCard } from '../components/ActivityCard';
import type { Stop, Activity, City } from '../types';
import api from '../lib/api';
import toast from 'react-hot-toast';

function SortableStop({ stop, onDelete, onToggle, expanded, tripId, onRefetch }: {
  stop: Stop; onDelete: () => void; onToggle: () => void;
  expanded: boolean; tripId: string; onRefetch: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [suggesting, setSuggesting] = useState(false);

  const removeActivity = async (saId: string) => {
    await api.delete(`/trips/${tripId}/stops/${stop.id}/activities/${saId}`);
    onRefetch();
  };

  const addActivity = async (activity: Activity) => {
    await api.post(`/trips/${tripId}/stops/${stop.id}/activities`, { activityId: activity.id });
    toast.success(`${activity.name} added!`);
    onRefetch();
  };

  const suggestActivities = async () => {
    setSuggesting(true);
    try {
      const days = stop.startDate && stop.endDate
        ? Math.ceil((new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / 86400000)
        : 3;
      const existingIds = stop.stopActivities.map((sa) => sa.activityId);
      const { data } = await api.post('/activities/suggest', { cityId: stop.cityId, duration: String(days), existingIds });
      for (const act of data.slice(0, 3)) {
        await api.post(`/trips/${tripId}/stops/${stop.id}/activities`, { activityId: act.id });
      }
      toast.success(`✨ Added ${Math.min(3, data.length)} suggested activities!`);
      onRefetch();
    } finally {
      setSuggesting(false);
    }
  };

  const totalCost = stop.stopActivities.reduce((s, sa) => s + (sa.customCost ?? sa.activity?.costEstimate ?? 0), 0);

  return (
    <div ref={setNodeRef} style={style} className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
          <GripVertical size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {stop.orderIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{stop.city?.flagEmoji || '📍'}</span>
            <h3 className="font-semibold truncate">{stop.city?.name}</h3>
            <span className="text-xs text-gray-400">{stop.city?.country}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <input type="date" className="text-xs text-gray-500 bg-transparent border-none outline-none cursor-pointer"
              value={stop.startDate?.split('T')[0] || ''}
              onChange={async (e) => { await api.patch(`/trips/${tripId}/stops/${stop.id}`, { startDate: e.target.value }); onRefetch(); }} />
            <span className="text-xs text-gray-400">→</span>
            <input type="date" className="text-xs text-gray-500 bg-transparent border-none outline-none cursor-pointer"
              value={stop.endDate?.split('T')[0] || ''}
              onChange={async (e) => { await api.patch(`/trips/${tripId}/stops/${stop.id}`, { endDate: e.target.value }); onRefetch(); }} />
            {totalCost > 0 && <span className="text-xs font-medium text-green-600 dark:text-green-400">💰 ${totalCost.toFixed(0)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={suggestActivities} disabled={suggesting}
            className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" title="AI Suggest">
            {suggesting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
          <button onClick={onDelete} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
          <button onClick={onToggle} className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
              {stop.stopActivities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No activities yet. Click ✨ for suggestions!</p>
              ) : (
                stop.stopActivities.map((sa) => (
                  <ActivityCard key={sa.id} activity={sa.activity} added onRemove={() => removeActivity(sa.id)} />
                ))
              )}
              <AddActivityInline cityId={stop.cityId} onAdd={addActivity} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddActivityInline({ cityId, onAdd }: { cityId: string; onAdd: (a: Activity) => void }) {
  const [open, setOpen] = useState(false);
  const { activities } = useActivities({ cityId, limit: '20' });

  if (!open) return (
    <button onClick={() => setOpen(true)} className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors flex items-center justify-center gap-2">
      <Plus size={14} /> Add Activity
    </button>
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Pick an activity</span>
        <button onClick={() => setOpen(false)}><X size={14} className="text-gray-400" /></button>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1.5">
        {activities.map((a) => (
          <ActivityCard key={a.id} activity={a} onAdd={(act) => { onAdd(act); setOpen(false); }} />
        ))}
      </div>
    </div>
  );
}

function AddStopModal({ tripId, onAdd, onClose }: { tripId: string; onAdd: () => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const { cities } = useCities(search ? { q: search } : {});

  const addStop = async (city: City) => {
    await api.post(`/trips/${tripId}/stops`, { cityId: city.id });
    toast.success(`${city.name} added!`);
    onAdd();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Add a Stop</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <input className="input mb-3" placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
        <div className="max-h-64 overflow-y-auto space-y-1.5">
          {cities.map((city) => (
            <button key={city.id} onClick={() => addStop(city)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
              <span className="text-2xl">{city.flagEmoji || '🌍'}</span>
              <div>
                <p className="font-medium text-sm">{city.name}</p>
                <p className="text-xs text-gray-500">{city.country} · {city.continent}</p>
              </div>
              <MapPin size={14} className="ml-auto text-gray-400" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const { trip, loading, refetch, setTrip } = useTripData(id);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAddStop, setShowAddStop] = useState(false);

  const toggleExpand = (stopId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(stopId) ? next.delete(stopId) : next.add(stopId);
      return next;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !trip) return;
    const stops = [...trip.stops];
    const oldIdx = stops.findIndex((s) => s.id === active.id);
    const newIdx = stops.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stops, oldIdx, newIdx).map((s, i) => ({ ...s, orderIndex: i }));
    setTrip({ ...trip, stops: reordered });
    await api.patch(`/trips/${id}/stops/reorder`, { stops: reordered.map((s) => ({ id: s.id, orderIndex: s.orderIndex })) });
  };

  const deleteStop = async (stopId: string) => {
    await api.delete(`/trips/${id}/stops/${stopId}`);
    toast.success('Stop removed');
    refetch();
  };

  const plannedDays = trip?.stops.reduce((acc, s) => {
    if (!s.startDate || !s.endDate) return acc;
    return acc + Math.ceil((new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 86400000);
  }, 0) ?? 0;

  const totalDays = trip?.startDate && trip?.endDate
    ? Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000)
    : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-brand-500" /></div>;
  if (!trip) return <div className="text-center py-16 text-gray-500">Trip not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{trip.stops.length} stops planned</p>
        </div>
        <button onClick={() => setShowAddStop(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Stop
        </button>
      </div>

      {/* Progress bar */}
      {totalDays > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Planning Progress</span>
            <span className="text-sm text-gray-500">{plannedDays} of {totalDays} days planned</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${Math.min(100, (plannedDays / totalDays) * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>
      )}

      {trip.stops.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold mb-2">No stops yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add cities to start building your itinerary</p>
          <button onClick={() => setShowAddStop(true)} className="btn-primary">Add First Stop</button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={trip.stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {trip.stops.map((stop) => (
                <SortableStop key={stop.id} stop={stop} tripId={id!}
                  expanded={expanded.has(stop.id)}
                  onToggle={() => toggleExpand(stop.id)}
                  onDelete={() => deleteStop(stop.id)}
                  onRefetch={refetch} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showAddStop && <AddStopModal tripId={id!} onAdd={refetch} onClose={() => setShowAddStop(false)} />}
    </div>
  );
}
