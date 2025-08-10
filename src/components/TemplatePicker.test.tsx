import { render, screen } from '@testing-library/react';
import { TemplatePicker } from './TemplatePicker';
import { useCanvasStore } from '@/store/canvasStore';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';

vi.mock('@/store/canvasStore');

describe('TemplatePicker', () => {
  it('should render the correct number of templates', async () => {
    (useCanvasStore as any).mockReturnValue({
      loadTemplate: vi.fn(),
    });

    render(
      <DropdownMenu>
        <TemplatePicker />
      </DropdownMenu>
    );

    const button = screen.getByRole('button');
    await userEvent.click(button);

    const templates = await screen.findAllByRole('menuitem');
    expect(templates).toHaveLength(2);
  });
});
