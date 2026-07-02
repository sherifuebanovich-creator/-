'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useMapStore } from '@/store/map.store';

export function useGeolocation() {
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  const { setUserLocation, setLocationError, followUser, setMapCenter } = useMapStore();
  const followUserRef = useRef(followUser);
  followUserRef.current = followUser;

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 3000) return;
        lastUpdateRef.current = now;

        const { latitude, longitude, speed, heading } = position.coords;
        const coords = { lat: latitude, lng: longitude };

        setUserLocation(
          coords,
          heading ?? 0,
          speed != null ? speed * 3.6 : 0, // m/s to km/h
        );

        if (followUserRef.current) {
          setMapCenter(coords);
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
        }
      },
      options,
    );
  }, [setUserLocation, setLocationError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const getOnce = useCallback(() => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
  }, []);

  useEffect(() => {
    startWatching();
    return stopWatching;
  }, [startWatching, stopWatching]);

  return { startWatching, stopWatching, getOnce };
}
