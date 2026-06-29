import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialiazeHealthKit, getStepCount } from '@/utils/stepCount/HealthKitManager';

const HK_GRANTED_KEY = '@strikeitoff:hk_granted';

export function useStepCount() {
  const [steps, setSteps] = useState<number>(0);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: if user already granted before, skip the tap and fetch directly.
  useEffect(() => {
    AsyncStorage.getItem(HK_GRANTED_KEY).then((val) => {
      if (val !== 'true') return;
      setLoading(true);
      getStepCount()
        .then((count) => {
          setSteps(count);
          setHasPermissions(true);
        })
        .finally(() => setLoading(false));
    });
  }, []);

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

    await AsyncStorage.setItem(HK_GRANTED_KEY, 'true');
    const count = await getStepCount();
    setSteps(count);
    setLoading(false);
  };

  return { steps, hasPermissions, loading, error, connect };
}
