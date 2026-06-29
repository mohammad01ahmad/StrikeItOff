import { useState, useEffect } from 'react';
import HealthKitManager from '@/utils/stepCount/HealthKitManager';
import { PermissionStatus } from '@/types/stepCount';

export function useStepCount() {
  const [steps, setSteps] = useState<number>(0);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silently mark unavailable on non-iOS devices; no sheet, no fetch.
  useEffect(() => {
    if (!HealthKitManager.isAvailable()) {
      setPermissionStatus('unavailable');
    }
  }, []);

  // Triggered by user tap. Flow: auth status (informational) → init → fetch.
  const requestAndFetch = async () => {

    console.log('[1] Button pressed')
    if (!HealthKitManager.isAvailable()) {
      console.log('[2] HKM unavailable')
      setPermissionStatus('unavailable');
      return;
    }
    console.log('[2] HKM available')

    setLoading(true);
    setError(null);

    try {
      // Informational only — iOS read-auth is always "authorized", so we don't
      // gate on this; we just record it.
      await HealthKitManager.getAuthStatus();
      console.log('[3] Auth available')

      // initHealthKit shows the permission sheet on first call; silent on subsequent.
      await HealthKitManager.requestPermissions();
      setPermissionStatus('granted');
      console.log('[4] Permission granted')

      const count = await HealthKitManager.getTodayStepCount();
      setSteps(count);
    } catch (e: unknown) {
      setPermissionStatus('denied');
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { steps, permissionStatus, loading, error, requestAndFetch };
}
