import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

export function useStepCount(): { steps: number | null; available: boolean } {
  const [steps, setSteps] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') loadIOS();
    else if (Platform.OS === 'android') loadAndroid();
  }, []);

  function loadIOS() {
    const perms: HealthKitPermissions = {
      permissions: { read: [AppleHealthKit.Constants.Permissions.StepCount], write: [] },
    };
    AppleHealthKit.isAvailable((err, avail) => {
      if (err || !avail) return;
      AppleHealthKit.initHealthKit(perms, (initErr) => {
        if (initErr) return;
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        AppleHealthKit.getStepCount({ date: start.toISOString() }, (stepErr, result) => {
          if (stepErr) return;
          setSteps(result.value);
          setAvailable(true);
        });
      });
    });
  }

  async function loadAndroid() {
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
    setSteps(records.reduce((sum, r) => sum + r.count, 0));
    setAvailable(true);
  }

  return { steps, available };
}
