'use client';
import dynamic from 'next/dynamic';
import { useMapStore } from '@/store/map.store';
import { useAuthStore } from '@/store/auth.store';
import { useGeolocation } from '@/hooks/useGeolocation';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomBar } from '@/components/navigation/BottomBar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { SearchPanel } from '@/components/navigation/SearchPanel';
import { RoutePanel } from '@/components/navigation/RoutePanel';
import { NavigationHUD } from '@/components/navigation/NavigationHUD';
import { ObjectDetailPanel } from '@/components/map/ObjectDetailPanel';
import { ReportPanel } from '@/components/map/ReportPanel';
import { VehicleModeToggle } from '@/components/navigation/VehicleModeToggle';

const MapView = dynamic(() => import('@/components/map/MapViewGL'), { ssr: false });

export default function MapApp() {
  const isSearchOpen = useMapStore(s => s.isSearchOpen);
  const isRoutesPanelOpen = useMapStore(s => s.isRoutesPanelOpen);
  const isSidebarOpen = useMapStore(s => s.isSidebarOpen);
  const selectedObject = useMapStore(s => s.selectedObject);
  const isReportPanelOpen = useMapStore(s => s.isReportPanelOpen);
  const navigation = useMapStore(s => s.navigation);

  const { user } = useAuthStore();
  useGeolocation();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-dark-bg" style={{ isolation: 'isolate' }}>
      <MapView />

      {navigation.isNavigating && <NavigationHUD />}

      {!navigation.isNavigating && <TopBar />}

      {!navigation.isNavigating && (
        <div className="absolute left-4 bottom-28 md:bottom-24 z-40">
          <VehicleModeToggle />
        </div>
      )}

      {!navigation.isNavigating && <BottomBar />}

      {isSearchOpen && <SearchPanel />}
      {isRoutesPanelOpen && <RoutePanel />}
      {selectedObject && <ObjectDetailPanel />}
      {isReportPanelOpen && <ReportPanel />}
      {isSidebarOpen && <Sidebar />}
    </div>
  );
}
