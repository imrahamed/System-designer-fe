import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from './useAutoSave';
import { useCanvasStore } from '@/store/canvasStore';
import { vi } from 'vitest';

vi.mock('@/store/canvasStore');

describe('useAutoSave hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call saveDesign when the design changes', () => {
    const saveDesign = vi.fn();
    const { rerender } = renderHook(
      ({ nodes, edges, isSaving }) => useAutoSave(),
      {
        initialProps: { nodes: [], edges: [], isSaving: false },
        wrapper: ({ children }) => {
          (useCanvasStore as any).mockReturnValue({
            nodes: [],
            edges: [],
            isSaving: false,
            saveDesign,
          });
          return children;
        },
      }
    );

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(saveDesign).toHaveBeenCalled();
  });
});
