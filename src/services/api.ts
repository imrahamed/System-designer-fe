import { MOCK_COMPONENTS } from '@/utils/mock-components';
import type { ComponentData } from '@/utils/mock-components';

// This function simulates fetching data from a remote API.
// In a real application, this would be an actual HTTP request.
export const fetchComponents = (): Promise<ComponentData[]> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(MOCK_COMPONENTS);
    }, 500);
  });
};

interface ValidationResponse {
  success: boolean;
  errors?: Record<string, string[]>;
}

// This function simulates backend validation.
export const validateProperties = (
  componentId: string,
  props: Record<string, any>
): Promise<ValidationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const componentDef = MOCK_COMPONENTS.find((c) => c.id === componentId);
      if (!componentDef) {
        return resolve({ success: false, errors: { form: ['Component not found.'] } });
      }

      const result = componentDef.schema.safeParse(props);

      if (!result.success) {
        // Format Zod errors into a shape that react-hook-form can use
        const formattedErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
        resolve({ success: false, errors: formattedErrors });
      } else {
        resolve({ success: true });
      }
    }, 300); // Shorter delay for validation
  });
};

// Types for the AI Service Layer
// Based on RFC 6902 JSON Patch
interface JsonPatch {
  op: 'replace' | 'add' | 'remove';
  path: string;
  value?: any;
}

export interface AIActionRequest {
  design: {
    nodes: any[]; // In a real app, use proper Node types
    edges: any[]; // In a real app, use proper Edge types
  };
  actionType: string;
  params?: Record<string, any>;
}

export interface AIActionResponse {
  success: boolean;
  message?: string;
  patches?: JsonPatch[];
}

// This function simulates a call to a LangChain AI agent
export const executeAIAction = (
  request: AIActionRequest
): Promise<AIActionResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Simulating AI Action:', request.actionType, request.params);

      // Mock response based on actionType
      if (request.actionType === 'EXPLAIN_DESIGN') {
        resolve({
          success: true,
          message: "This is a simple client-server architecture. An API Gateway routes requests to two backend services, Service A and Service B.",
        });
      } else if (request.actionType === 'REFACTOR' && request.design.nodes.length > 0) {
        resolve({
            success: true,
            message: "Suggested refactoring: Renamed Service A for clarity.",
            patches: [
                { op: 'replace', path: `/nodes/0/data/label`, value: 'Service A (Refactored)' }
            ]
        });
      } else if (request.actionType === 'AUTO_COMPLETE') {
        const newNode = {
            id: 'new_node_from_ai',
            position: { x: 300, y: 300 },
            data: { label: 'AI Added: Caching Layer', componentId: 'cache.redis.v1' } // Assuming a redis component exists
        };
        const newEdge = { id: 'e1-new', source: '1', target: 'new_node_from_ai' };
        resolve({
            success: true,
            message: "Auto-completed the design by adding a caching layer.",
            patches: [
                { op: 'add', path: '/nodes/-', value: newNode },
                { op: 'add', path: '/edges/-', value: newEdge },
            ]
        });
      } else if (request.actionType === 'SECURITY_AUDIT') {
        resolve({
            success: true,
            message: "Security Audit: Found a potential issue. Service B does not have authentication configured.",
        });
      }
      else {
        resolve({
          success: false,
          message: "AI action not recognized or not applicable.",
        });
      }
    }, 1000); // Simulate AI thinking time
  });
};


// --- Mock Save/Load Service ---

// In-memory store for the saved design
let savedDesign: { nodes: any[], edges: any[] } | null = null;

interface Design {
  nodes: any[];
  edges: any[];
}

export const saveDesign = (design: Design): Promise<{ success: boolean, id: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      savedDesign = design;
      const designId = `design_${Date.now()}`;
      console.log(`Design saved with mock ID: ${designId}`);
      resolve({ success: true, id: designId });
    }, 500);
  });
};

export const loadDesign = (id: string): Promise<{ success: boolean, design?: Design }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Attempting to load mock design with ID: ${id}`);
      if (savedDesign) {
        resolve({ success: true, design: savedDesign });
      } else {
        resolve({ success: false });
      }
    }, 500);
  });
};
