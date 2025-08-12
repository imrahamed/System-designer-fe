const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// A utility function to get the auth token from wherever it's stored
const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

interface RequestOptions extends RequestInit {
  // We can add custom options here if needed
}

// Mock implementation
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  console.log(`--- MOCK API CALL: ${options.method || 'GET'} ${endpoint} ---`);

  if (endpoint === '/components') {
    const { MOCK_COMPONENTS } = await import('@/utils/mock-components');
    return MOCK_COMPONENTS as any;
  }

  if (endpoint === '/designs') {
    return [] as any;
  }

  // Return empty object for other calls to prevent errors
  return Promise.resolve({} as T);
}

// Helper methods for common HTTP verbs

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
