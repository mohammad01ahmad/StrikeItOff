import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export function useStepCount() {
  const [steps, setSteps] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') checkIOS();
    else if (Platform.OS === 'android') checkAndroid();
  }, []);

  function checkIOS() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AHK = require('react-native-health');
    if (typeof AHK.isAvailable !== 'function') return;
    AHK.isAvailable((_err: unknown, avail: boolean) => {
      if (avail) setSupported(true);
    });
  }

  async function checkAndroid() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { initialize } = require('react-native-health-connect');
    const initialized = await initialize();
    if (initialized) setSupported(true);
  }

  const requestAccess = useCallback(() => {
    if (Platform.OS === 'ios') requestIOS();
    else if (Platform.OS === 'android') requestAndroid();
  }, []);

  function requestIOS() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AHK = require('react-native-health');
    const perms = {
      permissions: { read: [AHK.Constants.Permissions.StepCount], write: [] },
    };
    AHK.initHealthKit(perms, (err: unknown) => {
      if (err) return;
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
  }

  async function requestAndroid() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { requestPermission, readRecords } = require('react-native-health-connect');
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

  return { steps, available, supported, requestAccess };
}
