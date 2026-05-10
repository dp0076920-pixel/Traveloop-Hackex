import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      fetchMe: async () => {
        set({ loading: true });
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          const { data } = await api.get('/auth/me', { signal: controller.signal });
          clearTimeout(timeout);
          set({ user: data });
        } catch {
          set({ user: null });
        } finally {
          set({ loading: false });
        }
      },
      logout: async () => {
        await api.post('/auth/logout');
        set({ user: null });
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user }) }
  )
);
