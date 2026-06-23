import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  calendarToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: any | null) => void;
  setCalendarToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        calendarToken: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setCalendarToken: (calendarToken) => set({ calendarToken }),
        logout: () => set({ user: null, calendarToken: null, isAuthenticated: false })
      }),
      { name: 'vibeshift-auth-storage' }
    )
  )
);
