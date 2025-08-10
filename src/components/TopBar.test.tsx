import { render, screen, act } from '@testing-library/react';
import { TopBar } from './TopBar';
import { useCanvasStore, useTemporalStore } from '@/store/canvasStore';
import { vi } from 'vitest';
import * as api from '@/services/api';

vi.mock('@/store/canvasStore');
vi.mock('@/services/api');

describe('TopBar', () => {
  it('should render the correct buttons', async () => {
    (useCanvasStore as any).mockReturnValue({
      saveDesign: vi.fn(),
      loadDesign: vi.fn(),
      createNewDesign: vi.fn(),
      designId: 'test-id',
    });
    (useTemporalStore as any).mockReturnValue({
      undo: vi.fn(),
      redo: vi.fn(),
      pastStates: [],
      futureStates: [],
    });
    vi.mocked(api.getAllDesigns).mockResolvedValue([]);

    await act(async () => {
      render(<TopBar />);
    });

    const buttons = screen.getAllByRole('button');
    // Undo, Redo, Design Switcher, New Design, Save, Template Picker, Theme Toggle
    expect(buttons).toHaveLength(7);
  });
});
