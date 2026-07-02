import MapAppLoader from '@/components/map/MapAppLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function HomePage() {
  return (
    <main className="relative w-full h-dvh overflow-hidden">
      <ErrorBoundary>
        <MapAppLoader />
      </ErrorBoundary>
    </main>
  );
}
