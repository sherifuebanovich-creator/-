'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/auth.store';
import { I18nInitializer } from '@/i18n/I18nProvider';
import dynamic from 'next/dynamic';

const SessionSyncLazy = dynamic(() => import('@/components/auth/SessionSync').then(m => ({ default: m.SessionSync })), { ssr: false });

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

const SessionProviderLazy = lazy(() => import('next-auth/react').then(m => ({ default: m.SessionProvider })));

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return (
    <Suspense fallback={<>{children}</>}>
      <SessionProviderLazy>
        {children}
      </SessionProviderLazy>
    </Suspense>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  return (
    <AuthProvider>
      <QueryClientProvider client={client}>
        <SessionSyncLazy />
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
    </AuthProvider>
  );
}
