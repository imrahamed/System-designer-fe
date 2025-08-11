import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: 'div',
      h2: 'h2',
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

HTMLFormElement.prototype.requestSubmit = vi.fn();
