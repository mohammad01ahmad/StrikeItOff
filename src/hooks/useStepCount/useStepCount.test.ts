// Tests for useStepCount — iOS/HealthKit only.
// Mocks healthKitManager directly; no native module mocking needed.
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { healthKitManager } from '@/utils/stepCount/HealthKitManager';
import { useStepCount } from './useStepCount';

jest.mock('@/utils/stepCount/HealthKitManager', () => ({
  healthKitManager: {
    isAvailable: jest.fn(),
    getAuthStatus: jest.fn(),
    requestPermissions: jest.fn(),
    getTodayStepCount: jest.fn(),
  },
}));

const hkm = healthKitManager as jest.Mocked<typeof healthKitManager>;

beforeEach(() => jest.clearAllMocks());

describe('useStepCount', () => {
  it('sets permissionStatus:unavailable on mount when HealthKit is not available', async () => {
    hkm.isAvailable.mockReturnValue(false);

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => expect(result.current.permissionStatus).toBe('unavailable'));

    expect(result.current.steps).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('stays idle on mount when HealthKit is available (no auto-fetch)', async () => {
    hkm.isAvailable.mockReturnValue(true);

    const { result } = renderHook(() => useStepCount());
    await waitFor(() => {});

    expect(result.current.permissionStatus).toBe('idle');
    expect(hkm.requestPermissions).not.toHaveBeenCalled();
  });

  it('requestAndFetch: sets granted + steps on success', async () => {
    hkm.isAvailable.mockReturnValue(true);
    hkm.getAuthStatus.mockResolvedValue('granted');
    hkm.requestPermissions.mockResolvedValue(undefined);
    hkm.getTodayStepCount.mockResolvedValue(4200);

    const { result } = renderHook(() => useStepCount());

    await act(async () => { await result.current.requestAndFetch(); });

    expect(result.current.permissionStatus).toBe('granted');
    expect(result.current.steps).toBe(4200);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('requestAndFetch: sets denied + error when requestPermissions rejects', async () => {
    hkm.isAvailable.mockReturnValue(true);
    hkm.getAuthStatus.mockResolvedValue('idle');
    hkm.requestPermissions.mockRejectedValue(new Error('Permission denied'));

    const { result } = renderHook(() => useStepCount());

    await act(async () => { await result.current.requestAndFetch(); });

    expect(result.current.permissionStatus).toBe('denied');
    expect(result.current.error).toBe('Permission denied');
    expect(result.current.steps).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('requestAndFetch: handles 0 steps correctly (not treated as failure)', async () => {
    hkm.isAvailable.mockReturnValue(true);
    hkm.getAuthStatus.mockResolvedValue('granted');
    hkm.requestPermissions.mockResolvedValue(undefined);
    hkm.getTodayStepCount.mockResolvedValue(0);

    const { result } = renderHook(() => useStepCount());

    await act(async () => { await result.current.requestAndFetch(); });

    expect(result.current.permissionStatus).toBe('granted');
    expect(result.current.steps).toBe(0);
  });
});
