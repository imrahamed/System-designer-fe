import { render, screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from './ThemeProvider';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

vi.mock('./ThemeProvider');

describe('ThemeToggle', () => {
  it('should toggle the theme', async () => {
    const setTheme = vi.fn();
    (useTheme as any).mockReturnValue({ theme: 'light', setTheme });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
