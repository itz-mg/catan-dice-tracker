import { useState, useEffect, useRef, useCallback } from 'react';

export function useWakeLock(enabled: boolean = true) {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    if (wakeLockRef.current) return; // already held
    try {
      const lock = await (navigator as any).wakeLock.request('screen');
      wakeLockRef.current = lock;
      setIsActive(true);
      lock.addEventListener('release', () => {
        wakeLockRef.current = null;
        setIsActive(false);
      });
    } catch (err) {
      console.warn('Wake Lock request failed', err);
    }
  }, []);

  const release = useCallback(async () => {
    if (!wakeLockRef.current) return;
    try {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    } catch (err) {
      console.warn('Wake Lock release failed', err);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      request();
    } else {
      release();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Don't release on cleanup — let the enabled flag control it
    };
  }, [enabled, request, release]);

  return { isActive, request, release };
}
