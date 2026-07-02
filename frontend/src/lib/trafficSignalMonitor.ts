'use client';
import { haversineDist, bearing } from './geo';

export interface TrafficSignal {
  id: string;
  lat: number;
  lng: number;
  name: string;
  crossing?: string;
}

export interface TrafficSignalState {
  signalId: string;
  currentColor: 'red' | 'yellow' | 'green' | 'unknown';
  countdownSeconds: number;
  cycleDuration: number;
  updatedAt: number;
}

export interface TrafficSignalWarning {
  signal: TrafficSignal;
  distanceMeters: number;
  currentState: TrafficSignalState | null;
  estimatedTimeToSignal: number;
}

const WARNING_DISTANCE_M = 500;
const MIN_WARNING_INTERVAL_MS = 10000;

export function createTrafficSignalMonitor() {
  let signals: TrafficSignal[] = [];
  let realTimeData: Map<string, TrafficSignalState> = new Map();
  let userLat = 0;
  let userLng = 0;
  let userBearing = 0;
  let warnedSignals = new Map<string, number>();
  let realTimeSourceConnected = false;

  function setSignals(newSignals: TrafficSignal[]) {
    signals = newSignals;
  }

  function setRealTimeData(data: TrafficSignalState[]) {
    realTimeData = new Map(data.map((s) => [s.signalId, s]));
    realTimeSourceConnected = true;
  }

  function updatePosition(lat: number, lng: number, bearing: number) {
    userLat = lat;
    userLng = lng;
    userBearing = bearing;
  }

  function isAhead(lat: number, lng: number, aheadAngleDeg = 45): boolean {
    const b = bearing(userLat, userLng, lat, lng);
    let diff = b - userBearing;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    return Math.abs(diff) <= aheadAngleDeg;
  }

  function checkProximity(): TrafficSignalWarning | null {
    if (signals.length === 0) return null;

    let nearest: TrafficSignalWarning | null = null;

    for (const sig of signals) {
      const dist = haversineDist(userLat, userLng, sig.lat, sig.lng);
      if (dist > WARNING_DISTANCE_M) continue;
      if (!isAhead(sig.lat, sig.lng)) continue;

      const state = realTimeData.get(sig.id) || null;
      const estTime = userLat !== 0 ? dist / 8.33 : 0;

      const now = Date.now();
      const lastWarn = warnedSignals.get(sig.id) || 0;
      if (now - lastWarn < MIN_WARNING_INTERVAL_MS) continue;

      if (!nearest || dist < nearest.distanceMeters) {
        nearest = { signal: sig, distanceMeters: dist, currentState: state, estimatedTimeToSignal: estTime };
      }
    }

    return nearest;
  }

  function markWarned(signalId: string) {
    warnedSignals.set(signalId, Date.now());
  }

  function markPassed(signalId: string) {
    warnedSignals.delete(signalId);
  }

  function getSignals(): TrafficSignal[] {
    return signals;
  }

  function getRealTimeState(signalId: string): TrafficSignalState | null {
    return realTimeData.get(signalId) || null;
  }

  function isRealTimeAvailable(): boolean {
    return realTimeSourceConnected;
  }

  return {
    setSignals,
    setRealTimeData,
    updatePosition,
    checkProximity,
    markWarned,
    markPassed,
    getSignals,
    getRealTimeState,
    isRealTimeAvailable,
  };
}

export type TrafficSignalMonitor = ReturnType<typeof createTrafficSignalMonitor>;

export function getSignalColorEmoji(state: TrafficSignalState['currentColor']): string {
  switch (state) {
    case 'red': return '🔴';
    case 'yellow': return '🟡';
    case 'green': return '🟢';
    default: return '⚪';
  }
}

export function getSignalLabel(state: TrafficSignalState, lang: string): string {
  const colorLabels: Record<string, Record<string, string>> = {
    red: { ru: 'Красный', en: 'Red' },
    yellow: { ru: 'Жёлтый', en: 'Yellow' },
    green: { ru: 'Зелёный', en: 'Green' },
    unknown: { ru: 'Неизвестно', en: 'Unknown' },
  };

  const color = colorLabels[state.currentColor]?.[lang] || state.currentColor;
  const countdown = state.countdownSeconds > 0 ? ` (${state.countdownSeconds}c)` : '';
  return `${color}${countdown}`;
}
