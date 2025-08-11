import { apiClient } from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Design,
  CreateDesignRequest,
  UpdateDesignRequest,
  ReplaceDesignRequest,
  Component,
  Template,
  CreateTemplateRequest,
  MemoryItem,
  SaveMemoryRequest,
  RunAgentRequest,
  RunAgentResponse,
} from '@/types/api';
import type { Node, Edge } from 'reactflow';
import type { JsonPatch } from 'fast-json-patch';


// ========== Auth ==========

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>('/auth/login', data);
};

export const register = (data: RegisterRequest): Promise<User> => {
  return apiClient.post<User>('/auth/register', data);
};


// ========== Designs ==========

export const createDesign = (data: CreateDesignRequest): Promise<Design> => {
  return apiClient.post<Design>('/designs', data);
};

export const getAllDesigns = (): Promise<Design[]> => {
  return apiClient.get<Design[]>('/designs');
};

export const getDesignById = (id: string): Promise<Design> => {
  return apiClient.get<Design>(`/designs/${id}`);
};

export const updateDesign = (id: string, data: UpdateDesignRequest): Promise<Design> => {
  return apiClient.patch<Design>(`/designs/${id}`, data);
};

export const replaceDesign = (id: string, data: ReplaceDesignRequest): Promise<Design> => {
  return apiClient.put<Design>(`/designs/${id}`, data);
};


// ========== Components ==========

export const fetchComponents = (): Promise<Component[]> => {
  // The postman collection shows query params, we can add support for them later if needed.
  return apiClient.get<Component[]>('/components');
};

export const getComponentById = (id: string): Promise<Component> => {
  return apiClient.get<Component>(`/components/${id}`);
};


// ========== Templates ==========

export const createTemplate = (data: CreateTemplateRequest): Promise<Template> => {
  return apiClient.post<Template>('/templates', data);
};

export const getAllTemplates = (): Promise<Template[]> => {
  return apiClient.get<Template[]>('/templates');
};

export const getTemplateById = (id: string): Promise<Template> => {
  return apiClient.get<Template>(`/templates/${id}`);
};


// ========== Memory ==========

export const saveMemory = (data: SaveMemoryRequest): Promise<MemoryItem> => {
  return apiClient.post<MemoryItem>('/memory', data);
};

export const getMemory = (key?: string, projectId?: string): Promise<MemoryItem[]> => {
  const params = new URLSearchParams();
  if (key) params.append('key', key);
  if (projectId) params.append('projectId', projectId);
  return apiClient.get<MemoryItem[]>(`/memory?${params.toString()}`);
};


// ========== AI Features ==========

export const runAgent = (agentType: string, data: RunAgentRequest): Promise<RunAgentResponse> => {
  return apiClient.post<RunAgentResponse>(`/agent/${agentType}`, data);
};


// ========== Legacy/Refactored Functions ==========

// The old `validateProperties` is a client-side validation based on Zod schemas.
// The new backend doesn't seem to have this exact endpoint.
// We will keep the client-side validation logic for now, but it should be moved
// to the component that uses it. For now, we'll keep it here but note it's not a real API call.
import { MOCK_COMPONENTS } from '@/utils/mock-components'; // This will be removed later

interface ValidationResponse {
  success: boolean;
  errors?: Record<string, string[]>;
}
export const validateProperties = (
  componentId: string,
  props: Record<string, any>
): Promise<ValidationResponse> => {
  return new Promise((resolve) => {
    const componentDef = MOCK_COMPONENTS.find((c) => c.id === componentId);
    if (!componentDef) {
      return resolve({ success: false, errors: { form: ['Component not found.'] } });
    }
    const result = componentDef.schema.safeParse(props);
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
      resolve({ success: false, errors: formattedErrors });
    } else {
      resolve({ success: true });
    }
  });
};


// The design save/load functions will be handled by the canvasStore now,
// which will call the new design service functions.
// We are removing the old saveDesign and loadDesign functions.

// This is the new structure for saving a design
export const saveFullDesign = (designId: string, nodes: Node[], edges: Edge[]): Promise<Design> => {
    const payload: ReplaceDesignRequest = {
        canvas: {
            nodes,
            links: edges,
            meta: {},
        },
        message: "Auto-save design"
    };
    return replaceDesign(designId, payload);
}

// And for applying patches
export const patchDesign = (designId: string, patch: JsonPatch[], message: string): Promise<Design> => {
    const payload: UpdateDesignRequest = {
        patch,
        message
    };
    return updateDesign(designId, payload);
}
