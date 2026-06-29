// Contains the types for both Apple HK & Android Health


export type PermissionStatus = 'authorized' | 'denied' | 'notDetermined' | 'unavailable';

export interface StepResult {
    value: number;
    startDate: string;
    endDate: string;
}