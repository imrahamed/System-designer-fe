import { describe, it, expect, vi } from 'vitest';
import * as api from './api';
import { MOCK_COMPONENTS } from '@/utils/mock-components';
import { apiClient } from './apiClient';

// Mock the apiClient to prevent actual network calls
vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}));

describe('api service', () => {
  it('fetchComponents should call the correct endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(MOCK_COMPONENTS);
    const components = await api.fetchComponents();
    expect(apiClient.get).toHaveBeenCalledWith('/components');
    expect(components).toEqual(MOCK_COMPONENTS);
  });

  // The validateProperties function is now a client-side utility,
  // so its test remains valid as it doesn't use apiClient.
  it('validateProperties should return success for valid properties', async () => {
    const componentId = 'compute.lambda.v1';
    const props = { functionName: 'my-function', memorySize: 512 };
    const response = await api.validateProperties(componentId, props);
    expect(response.success).toBe(true);
  });

  it('validateProperties should return error for invalid properties', async () => {
    const componentId = 'compute.lambda.v1';
    const props = { functionName: 'my-function', memorySize: 0 };
    const response = await api.validateProperties(componentId, props);
    expect(response.success).toBe(false);
    expect(response.errors).toBeDefined();
  });

  it('runAgent should call the correct endpoint', async () => {
    const mockResponse = { success: true, patches: [], reasoning: 'Did a thing' };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const request = {
      goal: 'Test goal',
      designId: 'design-123',
    };
    const response = await api.runAgent('design', request);

    expect(apiClient.post).toHaveBeenCalledWith('/agent/design', request);
    expect(response).toEqual(mockResponse);
  });

  it('saveFullDesign should call the correct endpoint', async () => {
    const designId = 'design-123';
    const nodes = [{ id: '1', position: { x: 0, y: 0 }, data: {} }];
    const edges = [];
    const mockResponse = { id: designId, title: 'Test', canvas: { nodes, links: edges, meta: {} } };
    vi.mocked(apiClient.put).mockResolvedValue(mockResponse as any);

    await api.saveFullDesign(designId, nodes, edges);

    expect(apiClient.put).toHaveBeenCalledWith(`/designs/${designId}`, {
      canvas: {
        nodes,
        links: edges,
        meta: {},
      },
      message: "Auto-save design"
    });
  });
});
