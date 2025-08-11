import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import DesignerPage from './DesignerPage';
import { useCanvasStore } from '../store/canvasStore';
import { useAutoSave } from '@/hooks/useAutoSave';

// Mock dependencies
vi.mock('../store/canvasStore');
vi.mock('@/hooks/useAutoSave');
// Mocking Excalidraw itself to avoid rendering the actual canvas in JSDOM
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-mock" />),
}));
// Mock child components as well for a more focused unit test
vi.mock('@/components/ComponentPalette', () => ({
    ComponentPalette: () => <div data-testid="component-palette-mock" />
}));
vi.mock('@/components/RightSidebar', () => ({
    RightSidebar: () => <div data-testid="right-sidebar-mock" />
}));


describe('DesignerPage', () => {
    beforeEach(() => {
        // Setup mock return values for hooks
        (useCanvasStore as any).mockReturnValue({
          excalidrawElements: [],
          setExcalidrawElements: vi.fn(),
          componentLibrary: [],
          setSelectedComponentId: vi.fn(),
        });
        // Also mock the getState method
        (useCanvasStore as any).getState = vi.fn().mockReturnValue({
          excalidrawElements: [],
        });
        (useAutoSave as any).mockImplementation(() => {});
    });

  it('should render the main layout and Excalidraw mock', () => {
    render(<DesignerPage />);

    // Assert that the main container and the mock components are rendered
    expect(screen.getByTestId('designer-page')).toBeInTheDocument();
    expect(screen.getByTestId('excalidraw-mock')).toBeInTheDocument();
    expect(screen.getByTestId('component-palette-mock')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar-mock')).toBeInTheDocument();
  });
});
