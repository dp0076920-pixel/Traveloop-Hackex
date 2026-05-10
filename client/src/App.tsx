import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { AppLayout } from './components/layout/AppLayout';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import BudgetPage from './pages/BudgetPage';
import PackingPage from './pages/PackingPage';
import NotesPage from './pages/NotesPage';
import Community from './pages/Community';
import PublicItinerary from './pages/PublicItinerary';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  const { fetchMe } = useAuthStore();
  const { darkMode } = useUIStore();

  useEffect(() => {
    fetchMe();
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-gray-800 dark:text-white text-sm' }} />
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/explore/:token" element={<PublicItinerary />} />

        {/* Protected */}
        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/trips/new" element={<CreateTrip />} />
          <Route path="/trips/:id" element={<ItineraryView />} />
          <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
          <Route path="/trips/:id/budget" element={<BudgetPage />} />
          <Route path="/trips/:id/packing" element={<PackingPage />} />
          <Route path="/trips/:id/notes" element={<NotesPage />} />
          <Route path="/cities" element={<CitySearch />} />
          <Route path="/activities" element={<ActivitySearch />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Fallback routes for sidebar nav */}
          <Route path="/budget" element={<MyTrips />} />
          <Route path="/packing" element={<MyTrips />} />
          <Route path="/notes" element={<MyTrips />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
