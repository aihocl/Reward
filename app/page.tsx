'use client';

import React from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { Login } from '@/components/Login';
import { ManagerApp } from '@/components/ManagerApp';
import { AdminApp } from '@/components/AdminApp';

function AppContent() {
  const { state } = useStore();

  if (!state.user) {
    return <Login />;
  }

  if (state.user.role === 'adm') {
    return <AdminApp />;
  }

  return <ManagerApp />;
}

export default function Page() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
