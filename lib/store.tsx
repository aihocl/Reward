'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DF } from './initial-data';

interface AppState {
  db: typeof DF;
  user: { role: 'mgr' | 'adm'; id?: string } | null;
  theme: 'light' | 'dark';
}

interface StoreContextType {
  state: AppState;
  updateDb: (newDb: Partial<typeof DF> | ((prev: typeof DF) => typeof DF)) => void;
  setUser: (user: AppState['user']) => void;
  setTheme: (theme: AppState['theme']) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    db: JSON.parse(JSON.stringify(DF)),
    user: null,
    theme: 'dark'
  });
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage
    const storedDb = localStorage.getItem('hmpl_v6_db');
    const storedUser = localStorage.getItem('hmpl_v6_user');
    const storedTheme = localStorage.getItem('hmpl_t');

    const initialState: AppState = {
      db: storedDb ? JSON.parse(storedDb) : JSON.parse(JSON.stringify(DF)),
      user: storedUser ? JSON.parse(storedUser) : null,
      theme: (storedTheme as 'light' | 'dark') || 
             (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    };
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(initialState);
    if (initialState.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hmpl_v6_db', JSON.stringify(state.db));
      localStorage.setItem('hmpl_v6_user', JSON.stringify(state.user));
      localStorage.setItem('hmpl_t', state.theme);
      
      document.documentElement.setAttribute('data-theme', state.theme);
    }
  }, [state, mounted]);

  const updateDb = (newDb: Partial<typeof DF> | ((prev: typeof DF) => typeof DF)) => {
    setState(s => ({
      ...s,
      db: typeof newDb === 'function' ? newDb(s.db) : { ...s.db, ...newDb }
    }));
  };

  const setUser = (user: AppState['user']) => {
    setState(s => ({ ...s, user }));
  };

  const setTheme = (theme: AppState['theme']) => {
    setState(s => ({ ...s, theme }));
  };

  const logout = () => {
    setState(s => ({ ...s, user: null }));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null; /* or a loading spinner */
  }

  return (
    <StoreContext.Provider value={{ state, updateDb, setUser, setTheme, logout }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
