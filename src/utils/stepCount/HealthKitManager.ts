import { HealthKitPermissions, HealthInputOptions } from 'react-native-health';
import { NativeModules } from 'react-native';

// func: Get AppleHK permission
export const initialiazeHealthKit = (): Promise<boolean> => {
  const AppleHealthKitNative = NativeModules.AppleHealthKit;

  if (!AppleHealthKitNative || typeof AppleHealthKitNative.initHealthKit !== 'function') {
    console.log('[HealthKit] Native module not found. Are you on a custom dev build?');
    return Promise.resolve(false);
  }

  const permissions: HealthKitPermissions = {
    permissions: {
      read: [AppleHealthKitNative.Constants?.Permissions?.Steps || 'Steps'],
      write: [],
    },
  };

  return new Promise((resolve) => {
    AppleHealthKitNative.initHealthKit(permissions, (err: any) => {
      if (err) {
        console.log('Error getting permission', err);
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

// func: Get step Counts
export const getStepCount = (): Promise<number> => {
  const AppleHealthKitNative = NativeModules.AppleHealthKit;

  if (!AppleHealthKitNative || !AppleHealthKitNative.getStepCount) {
    return Promise.resolve(0);
  }

  const options: HealthInputOptions = {
    date: new Date().toISOString(),
    includeManuallyAdded: false,
  };

  return new Promise((resolve) => {
    AppleHealthKitNative.getStepCount(options, (err: any, results: any) => {
      if (err) {
        console.log('Error fetching steps', err);
        resolve(0);
        return;
      }
      resolve(results?.value ?? 0);
    });
  });
};
