const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// A utility function to get the auth token from wherever it's stored
// This will be properly implemented in the authentication step
const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token');
};

interface RequestOptions extends RequestInit {
  // We can add custom options here if needed
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to parse the error body for more context
      const errorBody = await response.json().catch(() => ({
        message: 'An unknown error occurred.',
      }));
      // Throw an error object that includes the status and body
      throw {
        status: response.status,
        message: errorBody.message || response.statusText,
        body: errorBody,
      };
    }

    // For 204 No Content, we can't call .json()
    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API request failed: ${config.method || 'GET'} ${url}`, error);
    // Re-throw the error so it can be caught by the caller
    throw error;
  }
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
