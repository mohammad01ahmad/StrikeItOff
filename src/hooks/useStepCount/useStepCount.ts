// Cross-platform hook that reads today's step count from the device's native fitness store
import { useState, useEffect, useCallback } from 'react';
import { healthKitManager } from '@/utils/stepCount/HealthKitManager';

export function useStepCount() {
  const [steps, setSteps] = useState<number>(0);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied' | 'unavailable'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // all business logic in in utils/stepCount/HealthKitManager
  const requestAndFetch = async () => {
    console.log('[1] button pressed')

    if (!healthKitManager.isAvailable()) {
      setPermissionStatus('unavailable');
      return;
    }

    setLoading(true);
    try {
      await healthKitManager.requestPermissions();
      setPermissionStatus('granted');
      const count = await healthKitManager.getTodayStepCount();
      setSteps(count);
    } catch (e: any) {
      setPermissionStatus('denied');
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestAndFetch();
  }, []);

  return { steps, permissionStatus, loading, error, requestAndFetch };
}

