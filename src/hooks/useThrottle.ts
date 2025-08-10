import { useRef, useCallback, useEffect } from 'react';

// A simple throttle hook
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const isThrottled = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    lastArgsRef.current = args;
    if (!isThrottled.current) {
      isThrottled.current = true;
      callbackRef.current(...args);
      setTimeout(() => {
        isThrottled.current = false;
        if (lastArgsRef.current) {
          callbackRef.current(...lastArgsRef.current);
          lastArgsRef.current = null;
        }
      }, delay);
    }
  }, [delay]);

  return throttledCallback;
}
