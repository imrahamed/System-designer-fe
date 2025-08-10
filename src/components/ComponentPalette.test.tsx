import { render, screen } from '@testing-library/react';
import { ComponentPalette } from './ComponentPalette';
import { useCanvasStore } from '@/store/canvasStore';
import { vi } from 'vitest';

vi.mock('@/store/canvasStore');

describe('ComponentPalette', () => {
  it('should render the correct number of components', () => {
    (useCanvasStore as any).mockReturnValue({
      componentLibrary: [
        { id: '1', name: 'Component 1', category: 'Compute' },
        { id: '2', name: 'Component 2', category: 'Database' },
      ],
      reduce: (fn: any) => fn,
    });

    render(<ComponentPalette />);

    const components = screen.getAllByRole('generic');
    expect(components).toHaveLength(2);
  });
});
