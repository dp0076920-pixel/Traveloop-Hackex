import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Search, Compass, Wallet, Package,
  BookOpen, Users, Settings, LogOut, Moon, Sun, Menu, X, Plus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trips', icon: Map, label: 'My Trips' },
  { to: '/cities', icon: Search, label: 'Explore Cities' },
  { to: '/activities', icon: Compass, label: 'Activities' },
  { to: '/community', icon: Users, label: 'Community' },
];

const TRIP_NAV = [
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/packing', icon: Package, label: 'Packing' },
  { to: '/notes', icon: BookOpen, label: 'Notes' },
];

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 flex flex-col lg:translate-x-0"
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">T</div>
            <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Traveloop</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* New Trip CTA */}
        <div className="p-4">
          <button onClick={() => navigate('/trips/new')}
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm">
            <Plus size={16} /> New Trip
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <div className="pt-3 pb-1 px-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Tools</p>
          </div>

          {TRIP_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user?.isAdmin && (
            <NavLink to="/admin"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1',
                isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}>
              <LayoutDashboard size={18} /> Admin
            </NavLink>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <NavLink to="/settings"
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}>
            <Settings size={18} /> Settings
          </NavLink>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={18} /> Logout
          </button>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export const TopBar = () => {
  const { setSidebarOpen } = useUIStore();
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10 flex items-center px-4 gap-3">
      <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-400">
        <Menu size={22} />
      </button>
      <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Traveloop</span>
    </div>
  );
};
