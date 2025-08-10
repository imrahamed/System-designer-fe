import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';
import { vi } from 'vitest';

describe('useThrottle hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle function calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 1000));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(2);

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(3);
  });
});
