import { render, screen, act } from '@testing-library/react';
import { OtherCursors } from './OtherCursors';
import { useCanvasStore } from '@/store/canvasStore';
import { vi } from 'vitest';

vi.mock('@/store/canvasStore');

describe('OtherCursors', () => {
  it('should render the correct number of cursors', () => {
    (useCanvasStore as any).mockImplementation((selector: any) => {
      const state = {
        otherCursors: {
          '1': { x: 10, y: 10, name: 'User 1' },
          '2': { x: 20, y: 20, name: 'User 2' },
        },
      };
      return selector(state);
    });

    render(<OtherCursors />);

    const cursors = screen.getAllByTestId('cursor');
    expect(cursors).toHaveLength(2);
  });
});
