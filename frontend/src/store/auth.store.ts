import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, UserPreferences } from '@/types';

interface AuthState {
  user: User | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setPreferences: (prefs: UserPreferences) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      preferences: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setPreferences: (preferences) => set({ preferences }),

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
        Cookies.set('access_token', accessToken, {
          expires: 1 / 96,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        Cookies.set('refresh_token', refreshToken, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      },

      logout: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null, isAuthenticated: false, preferences: null, accessToken: null, refreshToken: null });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'rovx-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, preferences: state.preferences }),
    },
  ),
);
