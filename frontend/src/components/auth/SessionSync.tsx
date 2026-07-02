'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { usersApi } from '@/lib/api';
import Cookies from 'js-cookie';

export function SessionSync() {
  const { data: session, status } = useSession();
  const { setUser, setTokens, isAuthenticated, accessToken } = useAuthStore();
  const syncedRef = useRef(false);
  const langAppliedRef = useRef(false);
  const sessionRef = useRef(session);

  useEffect(() => {
    if (sessionRef.current === session && syncedRef.current) return;
    sessionRef.current = session;

    if (status === 'authenticated' && session) {
      const { accessToken: sessionToken, refreshToken, rovxUser } = session as any;
      const cookieToken = Cookies.get('access_token');

      if (!sessionToken || !rovxUser) return;

      if (!cookieToken && sessionToken) {
        setTokens(sessionToken, refreshToken || '');
      }

      if (!syncedRef.current) {
        if (refreshToken) setTokens(sessionToken, refreshToken);
        setUser({
          id: rovxUser.id,
          email: rovxUser.email,
          username: rovxUser.username,
          displayName: rovxUser.displayName || rovxUser.username || '',
          avatar: rovxUser.avatar,
          role: rovxUser.role,
          subscription: rovxUser.subscription,
          preferredLang: rovxUser.preferredLang || 'ru',
          preferredVehicle: rovxUser.preferredVehicle || 'CAR',
          driverScore: rovxUser.driverScore ?? 5.0,
          reputation: rovxUser.reputation ?? 0,
          totalTrips: rovxUser.totalTrips ?? 0,
          totalDistance: rovxUser.totalDistance ?? 0,
          homeAddress: rovxUser.homeAddress,
          homeLat: rovxUser.homeLat,
          homeLng: rovxUser.homeLng,
          workAddress: rovxUser.workAddress,
          workLat: rovxUser.workLat,
          workLng: rovxUser.workLng,
          city: rovxUser.city,
        });
        syncedRef.current = true;

        if (!langAppliedRef.current) {
          langAppliedRef.current = true;
          const pendingLang = typeof window !== 'undefined' ? localStorage.getItem('pending_lang') : null;
          if (pendingLang && pendingLang !== (rovxUser.preferredLang || 'ru')) {
            usersApi.updateProfile({ preferredLang: pendingLang }).then(() => {
              useAuthStore.setState((state) => ({
                user: state.user ? { ...state.user, preferredLang: pendingLang } : null,
              }));
            }).catch(() => {}).finally(() => {
              localStorage.removeItem('pending_lang');
            });
          } else if (pendingLang) {
            localStorage.removeItem('pending_lang');
          }
        }
      }
    }
    if (status === 'unauthenticated') {
      syncedRef.current = false;
      langAppliedRef.current = false;
    }
  }, [status, setTokens, setUser]);

  return null;
}
