import { render, screen } from '@testing-library/react';
import { PropertiesPanel } from './PropertiesPanel';
import { useCanvasStore } from '@/store/canvasStore';
import { vi } from 'vitest';

vi.mock('@/store/canvasStore');

import { MOCK_COMPONENTS } from '@/utils/mock-components';

describe('PropertiesPanel', () => {
  it('should render the correct tabs', () => {
    (useCanvasStore as any).mockReturnValue({
      selectedComponentId: '1',
      nodes: [{ id: '1', data: { componentId: 'compute.lambda.v1' } }],
      componentLibrary: MOCK_COMPONENTS,
    });

    render(<PropertiesPanel />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent('Properties');
    expect(tabs[1]).toHaveTextContent('Docs');
  });
});
