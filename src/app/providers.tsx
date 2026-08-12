'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false} refetchInterval={0}>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1720',
            border: '1px solid #1E2D40',
            color: '#E2E8F0',
            fontFamily: 'var(--font-jetbrains), monospace',
          },
        }}
      />
    </SessionProvider>
  );
}
