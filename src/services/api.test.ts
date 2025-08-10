import { describe, it, expect, vi } from 'vitest';
import {
  fetchComponents,
  validateProperties,
  executeAIAction,
  saveDesign,
  loadDesign,
} from './api';
import { MOCK_COMPONENTS } from '@/utils/mock-components';

describe('api service', () => {
  it('fetchComponents should return mock components', async () => {
    const components = await fetchComponents();
    expect(components).toEqual(MOCK_COMPONENTS);
  });

  it('validateProperties should return success for valid properties', async () => {
    const componentId = 'compute.lambda.v1';
    const props = { functionName: 'my-function', memorySize: 512 };
    const response = await validateProperties(componentId, props);
    expect(response.success).toBe(true);
  });

  it('validateProperties should return error for invalid properties', async () => {
    const componentId = 'compute.lambda.v1';
    const props = { functionName: 'my-function', memorySize: 0 };
    const response = await validateProperties(componentId, props);
    expect(response.success).toBe(false);
    expect(response.errors).toBeDefined();
  });

  it('executeAIAction should return a response', async () => {
    const request = {
      design: { nodes: [], edges: [] },
      actionType: 'EXPLAIN_DESIGN',
    };
    const response = await executeAIAction(request);
    expect(response.success).toBe(true);
    expect(response.message).toBeDefined();
  });

  it('saveDesign and loadDesign should work together', async () => {
    const design = { nodes: [], edges: [] };
    const saveResponse = await saveDesign(design);
    expect(saveResponse.success).toBe(true);
    expect(saveResponse.id).toBeDefined();

    const loadResponse = await loadDesign(saveResponse.id);
    expect(loadResponse.success).toBe(true);
    expect(loadResponse.design).toEqual(design);
  });
});
