'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/auth.store';
import { SessionSync } from '@/components/auth/SessionSync';
import { I18nInitializer } from '@/i18n/I18nProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
  },
});

function SocketInitializer() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const { connect, disconnect } = useSocket();

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <SessionProvider>
      <SessionSync />
      <QueryClientProvider client={client}>
        <I18nInitializer />
        <SocketInitializer />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#111827', color: '#fff', border: '1px solid #1f2937', borderRadius: '12px' },
            success: { iconTheme: { primary: '#0ea5e9', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
