'use client';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

function MapLoading() {
  const { t } = useTranslation();
  return (
    <div className="min-h-dvh bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">{t('mapPage.loading')}</p>
      </div>
    </div>
  );
}

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function MapPage() {
  return <MapView />;
}
