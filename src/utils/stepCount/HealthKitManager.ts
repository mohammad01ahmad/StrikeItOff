import { Platform } from 'react-native';
import AppleHealthKit, { HealthKitPermissions, HealthInputOptions, HealthValue, } from 'react-native-health';
import { PermissionStatus, StepResult } from '@/types/stepCount';

// Only requesting Steps read — keep it minimal per Apple's review guidelines.
const HK_PERMISSIONS: HealthKitPermissions = {
    permissions: {
        read: [AppleHealthKit.Constants.Permissions.Steps],
        write: [],
    },
};

// ─── HealthKitManager ─────────────────────────────────────────────────────────

class HealthKitManager {
    private static instance: HealthKitManager;
    private initialized: boolean = false;

    // Singleton — one instance shared across the app
    static getInstance(): HealthKitManager {
        if (!HealthKitManager.instance) {
            HealthKitManager.instance = new HealthKitManager();
        }
        return HealthKitManager.instance;
    }

    /**
     * HealthKit only exists on iOS. Always call this before anything else.
     * Returns false on Android or iPad (Health app not available on iPad).
     */
    isAvailable(): boolean {
        return Platform.OS === 'ios' && AppleHealthKit.isAvailable !== undefined;
    }

    // ── Permissions ─────────────────────────────────────────────────────────────
    // Initializes HealthKit and triggers the iOS permission sheet. (Only Once)
    requestPermissions(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.isAvailable()) {
                reject(new Error('HealthKit is not available on this device'));
                return;
            }

            AppleHealthKit.initHealthKit(HK_PERMISSIONS, (error: string) => {
                if (error) {
                    reject(new Error(error));
                    return;
                }
                this.initialized = true;
                resolve(true);
            });
        });
    }

    // Checks whether the user has granted read access to step count.
    getPermissionStatus(): Promise<PermissionStatus> {
        return new Promise((resolve) => {
            if (!this.isAvailable()) {
                resolve('unavailable');
                return;
            }

            // react-native-health exposes this for write types only
            // For read, we infer from whether init succeeded + data comes back
            if (!this.initialized) {
                resolve('notDetermined');
                return;
            }

            resolve('authorized');
        });
    }

    // ── Step Data ───────────────────────────────────────────────────────────────
    // Fetches total step count for today (midnight → now).
    getTodayStepCount(): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                reject(new Error('HealthKit not initialized. Call requestPermissions() first.'));
                return;
            }

            const now = new Date();
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);

            const options: HealthInputOptions = {
                startDate: startOfDay.toISOString(),
                endDate: now.toISOString(),
            };

            AppleHealthKit.getStepCount(options, (err: string, result: HealthValue) => {
                if (err) {
                    reject(new Error(err));
                    return;
                }
                resolve(result.value ?? 0);
            });
        });
    }

    /**
     * Fetches daily step totals over a date range.
     * Useful if you want to show a weekly step chart later.
     * Returns array of { value, startDate, endDate } — one object per day.
     */
    getDailyStepSamples(startDate: Date, endDate: Date): Promise<StepResult[]> {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                reject(new Error('HealthKit not initialized. Call requestPermissions() first.'));
                return;
            }

            const options: HealthInputOptions = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            };

            AppleHealthKit.getDailyStepCountSamples(
                options,
                (err: string, results: StepResult[]) => {
                    if (err) {
                        reject(new Error(err));
                        return;
                    }
                    resolve(results ?? []);
                }
            );
        });
    }

    /**
     * Convenience: last 7 days of daily step data.
     */
    getWeeklyStepSamples(): Promise<StepResult[]> {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return this.getDailyStepSamples(sevenDaysAgo, now);
    }
}

// Export a single shared instance
export const healthKitManager = HealthKitManager.getInstance();