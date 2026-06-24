import { renderHook, waitFor } from '@testing-library/react-native';

let mockPlatformOS = 'ios';
jest.mock('react-native', () => ({
  Platform: { get OS() { return mockPlatformOS; } },
}));

jest.mock('react-native-health', () => ({
  isAvailable: jest.fn(),
  initHealthKit: jest.fn(),
  getStepCount: jest.fn(),
  Constants: { Permissions: { StepCount: 'HKQuantityTypeIdentifierStepCount' } },
}));

jest.mock('react-native-health-connect', () => ({
  initialize: jest.fn(),
  requestPermission: jest.fn(),
  readRecords: jest.fn(),
}));

import * as HealthKit from 'react-native-health';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { useStepCount } from './useStepCount';

const mockAHK = HealthKit as Record<string, jest.Mock>;
const mockInit = initialize as jest.Mock;
const mockReadRecords = readRecords as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useStepCount — iOS', () => {
  beforeEach(() => { mockPlatformOS = 'ios'; });

  it('returns steps and available:true when HealthKit succeeds', async () => {
    (mockAHK.isAvailable as jest.Mock).mockImplementation((cb) => cb(null, true));
    (mockAHK.initHealthKit as jest.Mock).mockImplementation((_p, cb) => cb(null));
    (mockAHK.getStepCount as jest.Mock).mockImplementation((_o, cb) => cb(null, { value: 4200 }));

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => expect(result.current.available).toBe(true));

    expect(result.current.steps).toBe(4200);
    expect(result.current.available).toBe(true);
  });

  it('returns available:false when HealthKit is not available on device', async () => {
    (mockAHK.isAvailable as jest.Mock).mockImplementation((cb) => cb(null, false));

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => {});

    expect(result.current.steps).toBeNull();
    expect(result.current.available).toBe(false);
  });

  it('returns available:false when initHealthKit fails (permission denied)', async () => {
    (mockAHK.isAvailable as jest.Mock).mockImplementation((cb) => cb(null, true));
    (mockAHK.initHealthKit as jest.Mock).mockImplementation((_p, cb) => cb('Permission denied'));

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => {});

    expect(result.current.steps).toBeNull();
    expect(result.current.available).toBe(false);
  });
});

describe('useStepCount — Android', () => {
  beforeEach(() => { mockPlatformOS = 'android'; });

  it('returns summed steps and available:true when Health Connect succeeds', async () => {
    mockInit.mockResolvedValue(true);
    (requestPermission as jest.Mock).mockResolvedValue([]);
    mockReadRecords.mockResolvedValue({ records: [{ count: 2000 }, { count: 1500 }] });

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => expect(result.current.available).toBe(true));

    expect(result.current.steps).toBe(3500);
    expect(result.current.available).toBe(true);
  });

  it('returns available:false when Health Connect cannot initialize', async () => {
    mockInit.mockResolvedValue(false);

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => {});

    expect(result.current.steps).toBeNull();
    expect(result.current.available).toBe(false);
  });

  it('returns 0 steps when there are no records for today', async () => {
    mockInit.mockResolvedValue(true);
    (requestPermission as jest.Mock).mockResolvedValue([]);
    mockReadRecords.mockResolvedValue({ records: [] });

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => expect(result.current.available).toBe(true));

    expect(result.current.steps).toBe(0);
  });
});
