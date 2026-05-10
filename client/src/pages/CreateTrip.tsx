import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Loader2, Upload } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STEPS = ['Basics', 'Details', 'Budget'];

export default function CreateTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', startDate: '', endDate: '',
    totalBudget: '', isPublic: false, coverImage: '',
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('coverImage', reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/trips', {
        ...form,
        totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : null,
      });
      toast.success('Trip created! 🎉');
      navigate(`/trips/${data.id}/builder`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Create New Trip</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Plan your next adventure</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-brand-600' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Trip Basics</h2>
              <div>
                <label className="text-sm font-medium block mb-1">Trip Name *</label>
                <input className="input" placeholder="e.g. Europe Summer 2025" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="What's this trip about?" value={form.description} onChange={(e) => update('description', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Cover Photo</label>
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-brand-400 transition-colors overflow-hidden">
                  {form.coverImage ? (
                    <img src={form.coverImage} className="w-full h-full object-cover" alt="cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload size={24} />
                      <span className="text-sm">Click to upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Travel Dates</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Start Date</label>
                  <input type="date" className="input" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">End Date</label>
                  <input type="date" className="input" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <input type="checkbox" id="public" checked={form.isPublic} onChange={(e) => update('isPublic', e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <div>
                  <label htmlFor="public" className="text-sm font-medium cursor-pointer">Make trip public</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Others can discover and copy your itinerary</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="font-semibold text-lg">Budget</h2>
              <div>
                <label className="text-sm font-medium block mb-1">Total Budget (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input type="number" className="input pl-7" placeholder="e.g. 3000" value={form.totalBudget} onChange={(e) => update('totalBudget', e.target.value)} />
                </div>
              </div>
              <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
                <h3 className="font-semibold text-brand-700 dark:text-brand-300 mb-2">Trip Summary</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>📌 <strong>{form.name || 'Unnamed Trip'}</strong></p>
                  {form.startDate && <p>📅 {form.startDate} → {form.endDate || '?'}</p>}
                  {form.totalBudget && <p>💰 Budget: ${parseFloat(form.totalBudget).toLocaleString()}</p>}
                  <p>🌐 {form.isPublic ? 'Public trip' : 'Private trip'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-40">
            <ChevronLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !form.name.trim()} className="btn-primary flex items-center gap-2">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={submit} disabled={loading || !form.name.trim()} className="btn-primary flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Create Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
