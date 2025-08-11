import { render, screen, act } from '@testing-library/react';
import { TopBar } from './TopBar';
import { useCanvasStore, useTemporalStore } from '@/store/canvasStore';
import { vi } from 'vitest';
import * as api from '@/services/api';
import { AuthProvider } from '@/contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/store/canvasStore');
vi.mock('@/services/api');

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/contexts/AuthContext')>();
  return {
    ...mod,
    useAuth: () => ({
      logout: vi.fn(),
      token: 'test-token',
      user: { id: '1', email: 'test@test.com'},
      isLoading: false,
      login: vi.fn(),
    }),
  };
});

describe('TopBar', () => {
  it('should render the correct buttons', async () => {
    (useCanvasStore as any).mockReturnValue({
      saveDesign: vi.fn(),
      loadDesign: vi.fn(),
      createNewDesign: vi.fn(),
      designId: 'test-id',
      otherCursors: {},
    });
    (useTemporalStore as any).mockReturnValue({
      undo: vi.fn(),
      redo: vi.fn(),
      pastStates: [],
      futureStates: [],
    });
    vi.mocked(api.getAllDesigns).mockResolvedValue([]);

    await act(async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <TopBar />
          </AuthProvider>
        </MemoryRouter>
      );
    });

    const buttons = screen.getAllByRole('button');
    // Undo, Redo, Design Switcher, New Design, Save, Template Picker, Theme Toggle, Logout
    expect(buttons).toHaveLength(8);
    expect(screen.getByTitle('Logout')).toBeInTheDocument();
  });
});
