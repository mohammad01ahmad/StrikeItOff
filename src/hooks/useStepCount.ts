import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useStepCount(): { steps: number | null; available: boolean } {
  const [steps, setSteps] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') loadIOS();
    else if (Platform.OS === 'android') loadAndroid();
  }, []);

  function loadIOS() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AHK = require('react-native-health');
    // Native module not linked (needs expo prebuild + pod install)
    if (typeof AHK.isAvailable !== 'function') return;
    const perms = {
      permissions: { read: [AHK.Constants.Permissions.StepCount], write: [] },
    };
    AHK.isAvailable((err: unknown, avail: boolean) => {
      if (err || !avail) return;
      AHK.initHealthKit(perms, (initErr: unknown) => {
        if (initErr) return;
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        AHK.getStepCount(
          { date: start.toISOString() },
          (stepErr: unknown, result: { value: number }) => {
            if (stepErr) return;
            setSteps(result.value);
            setAvailable(true);
          }
        );
      });
    });
  }

  async function loadAndroid() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initialize, requestPermission, readRecords } = require('react-native-health-connect');
    const initialized = await initialize();
    if (!initialized) return;
    await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { records } = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: start.toISOString(),
        endTime: new Date().toISOString(),
      },
    });
    setSteps(records.reduce((sum: number, r: { count: number }) => sum + r.count, 0));
    setAvailable(true);
  }

  return { steps, available };
}
