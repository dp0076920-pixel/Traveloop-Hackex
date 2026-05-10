import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Plane } from 'lucide-react';
import { z } from 'zod';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});
const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Min 2 characters'),
});

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const schema = tab === 'login' ? loginSchema : signupSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0]] = e.message; });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      setUser(data.user);
      toast.success(tab === 'login' ? 'Welcome back! ✈️' : 'Account created! 🎉');
      navigate('/dashboard');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-500 relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          {['🗼', '🗽', '🏯', '🕌', '🏔️', '🌴', '🗺️', '✈️'].map((emoji, i) => (
            <motion.div key={i} className="absolute text-6xl"
              style={{ left: `${(i * 13) % 90}%`, top: `${(i * 17) % 80}%` }}
              animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}>
              {emoji}
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Plane size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Plan Your Dream Trip</h1>
          <p className="text-white/80 text-lg max-w-sm">Multi-city itineraries, budget tracking, and collaborative planning — all in one place.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['50+', 'Cities'], ['200+', 'Activities'], ['∞', 'Memories']].map(([num, label]) => (
              <div key={label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{num}</div>
                <div className="text-xs text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Plane size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Traveloop</h1>
          </div>

          <div className="card p-8">
            {/* Tab toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
              {(['login', 'signup'] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.form key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={submit} className="space-y-4">
                {tab === 'signup' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                    <input className={`input ${errors.name ? 'border-red-400' : ''}`} placeholder="John Doe"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Email</label>
                  <input className={`input ${errors.email ? 'border-red-400' : ''}`} type="email" placeholder="you@example.com"
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Password</label>
                  <div className="relative">
                    <input className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
