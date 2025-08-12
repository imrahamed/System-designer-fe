import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import DesignerPage from './DesignerPage';
import { useCanvasStore } from '../store/canvasStore';
import { useAutoSave } from '@/hooks/useAutoSave';

// Mock dependencies
vi.mock('../store/canvasStore');
vi.mock('@/hooks/useAutoSave');

// Mock tldraw library
vi.mock('tldraw', async () => {
  const original = await vi.importActual('tldraw');
  return {
    ...original,
    Tldraw: vi.fn(({ children }) => <div data-testid="tldraw-mock">{children}</div>),
    useEditor: vi.fn(() => ({
      screenToPage: vi.fn(),
      createShape: vi.fn(),
      store: {
        listen: vi.fn(() => () => {}), // Return an unsubscribe function
        loadSnapshot: vi.fn(),
        getSnapshot: vi.fn(() => ({ store: {} })),
      },
      getSelectedShapeIds: vi.fn(() => []),
    })),
  };
});

// Mock child components
vi.mock('@/components/ComponentPalette', () => ({
    ComponentPalette: () => <div data-testid="component-palette-mock" />
}));
vi.mock('@/components/RightSidebar', () => ({
    RightSidebar: () => <div data-testid="right-sidebar-mock" />
}));

describe('DesignerPage', () => {
    beforeEach(() => {
        (useCanvasStore as any).mockReturnValue({
          setExcalidrawElements: vi.fn(),
          setSelectedComponentId: vi.fn(),
          componentLibrary: [],
        });
        (useCanvasStore as any).getState = vi.fn().mockReturnValue({
          excalidrawElements: [],
        });
        (useAutoSave as any).mockImplementation(() => {});
    });

  it('should render the main layout and Tldraw mock', () => {
    render(<DesignerPage />);

    expect(screen.getByTestId('designer-page')).toBeInTheDocument();
    expect(screen.getByTestId('tldraw-mock')).toBeInTheDocument();
    expect(screen.getByTestId('component-palette-mock')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar-mock')).toBeInTheDocument();
  });
});
