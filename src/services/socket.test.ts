import { describe, it, expect } from 'vitest';
import { socketService } from './socket';

describe('socket service', () => {
  it('should be initialized', () => {
    expect(socketService).toBeDefined();
  });
});
