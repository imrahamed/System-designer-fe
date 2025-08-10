import { render, screen } from '@testing-library/react';
import { TopBar } from './TopBar';
import { useCanvasStore, useTemporalStore } from '@/store/canvasStore';
import { vi } from 'vitest';

vi.mock('@/store/canvasStore');

describe('TopBar', () => {
  it('should render the correct buttons', () => {
    (useCanvasStore as any).mockReturnValue({
      executeAIAction: vi.fn(),
      saveDesign: vi.fn(),
      loadDesign: vi.fn(),
    });
    (useTemporalStore as any).mockReturnValue({
      undo: vi.fn(),
      redo: vi.fn(),
      pastStates: [],
      futureStates: [],
    });

    render(<TopBar />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });
});
