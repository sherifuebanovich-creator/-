'use client';
import { FaCar, FaTruck } from 'react-icons/fa';
import { useMapStore } from '@/store/map.store';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function VehicleModeToggle() {
  const { t } = useTranslation();
  const { vehicleMode, setVehicleMode } = useMapStore();

  return (
    <div className="glass-dark rounded-xl p-1 flex flex-col md:flex-row gap-1">
      <button onClick={() => setVehicleMode('CAR')}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-all ${
          vehicleMode === 'CAR' ? 'bg-primary-600 text-white shadow-glow-primary' : 'text-gray-500 hover:text-gray-300'
        }`}
        title={t('vehicleModeToggle.carMode')}>
        <FaCar size={18} />
      </button>
      <button onClick={() => setVehicleMode('TRUCK')}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-all ${
          vehicleMode === 'TRUCK' ? 'bg-accent-500 text-white shadow-glow-accent' : 'text-gray-500 hover:text-gray-300'
        }`}
        title={t('vehicleModeToggle.truckMode')}>
        <FaTruck size={18} />
      </button>
    </div>
  );
}
