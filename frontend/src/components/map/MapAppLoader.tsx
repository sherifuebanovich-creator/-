'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/auth.store';
import { useTranslation } from 'react-i18next';

function MapLoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center w-full h-dvh bg-dark-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-primary-400/50 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-primary-500 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="font-display text-xl font-bold text-gradient">{t('mapAppLoader.brand')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('mapAppLoader.loading')}</p>
        </div>
      </div>
    </div>
  );
}

const MapApp = dynamic(() => import('@/components/map/MapApp'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

export default function MapAppLoader() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { status: sessionStatus } = useSession();
  const hasAccessToken = typeof window !== 'undefined' ? !!Cookies.get('access_token') : false;
  const isActuallyAuthed = isAuthenticated || hasAccessToken || user !== null;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const hasToken = !!Cookies.get('access_token');

    if (isAuthenticated || user || sessionStatus === 'authenticated' || hasToken) {
      setChecking(false);
      return;
    }

    const hasVisited = localStorage.getItem('rovx_hasVisitedBefore');
    if (!hasVisited) {
      localStorage.setItem('rovx_hasVisitedBefore', 'true');
      router.replace('/auth/register');
    } else {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user, router, sessionStatus]);

  if (checking && !isActuallyAuthed && sessionStatus !== 'authenticated') {
    return (
      <div className="flex items-center justify-center w-full h-dvh bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-primary-400/50 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-primary-500 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-gradient">{t('mapAppLoader.brand')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('mapAppLoader.loadingRu')}</p>
          </div>
        </div>
      </div>
    );
  }

  return <MapApp />;
}
