// Based on the Postman Collection

// ========== Auth ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
}


// ========== Designs ==========
export interface Design {
  id: string;
  title: string;
  description: string;
  canvas: {
    nodes: any[]; // Consider using React Flow Node type
    links: any[]; // Consider using React Flow Edge type
    meta: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignRequest {
  title: string;
  description: string;
}

export interface UpdateDesignRequest {
  patch: {
    op: 'replace' | 'add' | 'remove';
    path: string;
    value: any;
  }[];
  message: string;
}

export interface ReplaceDesignRequest {
  canvas: {
    nodes: any[];
    links: any[];
    meta: Record<string, any>;
  };
  message: string;
}


// ========== Components ==========
export interface Component {
  id: string;
  name: string;
  category: string;
  tags: string[];
  props: Record<string, any>;
  styles: Record<string, any>;
  previewUrl?: string;
  usageCount?: number;
}


// ========== Templates ==========
export interface Template {
  id: string;
  name: string;
  description: string;
  components: {
    componentId: string;
    props: Record<string, any>;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  id: string;
  name: string;
  description: string;
  components: {
    componentId: string;
    props: Record<string, any>;
  }[];
  createdBy: string;
}


// ========== Memory ==========
export interface MemoryItem {
  id: string;
  userId: string;
  projectId?: string;
  key: string;
  value: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveMemoryRequest {
  userId: string;
  projectId?: string;
  key: string;
  value: Record<string, any>;
  tags: string[];
}


// ========== AI Features ==========
import type { Patch } from 'fast-json-patch';

export interface RunAgentRequest {
  goal: string;
  designId: string;
  dryRun?: boolean;
  constraints?: Record<string, any>;
}

export interface RunAgentResponse {
  success: boolean;
  patches: Patch[];
  reasoning: string;
  message?: string;
  preview?: {
    components: any[];
    layout: any;
  };
}
