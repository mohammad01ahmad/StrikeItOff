import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialiazeHealthKit, getStepCount } from '@/utils/stepCount/HealthKitManager';

export function useStepCount() {
  const [steps, setSteps] = useState<number>(0);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tap-triggered: init HealthKit (shows permission sheet on first call only),
  // then fetch steps. Persists the grant so future mounts auto-fetch.
  const connect = async () => {
    setLoading(true);
    setError(null);

    const granted = await initialiazeHealthKit();
    setHasPermissions(granted);

    if (!granted) {
      setError('Allow Apple Health access to see your step count');
      setLoading(false);
      return;
    }

    const count = await getStepCount();
    setSteps(count);
    setLoading(false);
  };

  return { steps, hasPermissions, loading, error, connect };
}
