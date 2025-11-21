// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://todo-app.pioneeralpha.com';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Helper to create FormData from object
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
}

// Auth API functions
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const formData = createFormData(credentials);
    const response = await fetchApi<{ access: string; refresh: string }>('/api/auth/login/', {
      method: 'POST',
      body: formData,
    });
    
    // Store tokens
    if (typeof window !== 'undefined' && response) {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
    
    return response;
  },

  signup: async (data: { first_name: string; last_name: string; email: string; password: string }) => {
    const formData = createFormData(data);
    const response = await fetchApi<{ id: number; email: string; first_name: string; last_name: string }>('/api/users/signup/', {
      method: 'POST',
      body: formData,
    });
    return response;
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    return fetchApi<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      address?: string;
      contact_number?: string;
      birthday?: string;
      profile_image?: string;
      bio?: string;
    }>('/api/users/me/');
  },

  updateProfile: async (data: Partial<{
    first_name: string;
    last_name: string;
    address: string;
    contact_number: string;
    birthday: string;
    bio: string;
    profile_image: File;
  }>) => {
    const formData = createFormData(data as Record<string, any>);
    return fetchApi<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      address?: string;
      contact_number?: string;
      birthday?: string;
      profile_image?: string;
      bio?: string;
    }>('/api/users/me/', {
      method: 'PATCH',
      body: formData,
    });
  },

  changePassword: async (data: { old_password: string; new_password: string }) => {
    const formData = createFormData(data);
    return fetchApi<{ detail: string }>('/api/users/change-password/', {
      method: 'POST',
      body: formData,
    });
  },
};

// Todo API functions
export const todoApi = {
  getAll: async (params?: {
    is_completed?: boolean;
    priority?: 'extreme' | 'moderate' | 'low';
    todo_date?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/api/todos/${queryString ? `?${queryString}` : ''}`;
    return fetchApi<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: number;
        title: string;
        description?: string;
        priority: 'extreme' | 'moderate' | 'low';
        is_completed: boolean;
        position: number;
        todo_date?: string;
        created_at: string;
        updated_at: string;
      }>;
    }>(endpoint);
  },

  create: async (data: {
    title: string;
    description?: string;
    priority?: 'extreme' | 'moderate' | 'low';
    todo_date?: string;
  }) => {
    const formData = createFormData({
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'moderate',
      todo_date: data.todo_date || new Date().toISOString().split('T')[0],
    });
    return fetchApi<{
      id: number;
      title: string;
      description?: string;
      priority: 'extreme' | 'moderate' | 'low';
      is_completed: boolean;
      position: number;
      todo_date?: string;
      created_at: string;
      updated_at: string;
    }>('/api/todos/', {
      method: 'POST',
      body: formData,
    });
  },

  update: async (
    id: number,
    data: Partial<{
      title: string;
      description: string;
      priority: 'extreme' | 'moderate' | 'low';
      todo_date: string;
      is_completed: boolean;
      position: number;
    }>
  ) => {
    const formData = createFormData(data as Record<string, any>);
    return fetchApi<{
      id: number;
      title: string;
      description?: string;
      priority: 'extreme' | 'moderate' | 'low';
      is_completed: boolean;
      position: number;
      todo_date?: string;
      created_at: string;
      updated_at: string;
    }>(`/api/todos/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
  },

  delete: async (id: number) => {
    return fetchApi<null>(`/api/todos/${id}/`, {
      method: 'DELETE',
    });
  },

  reorder: async (todos: { id: number; position: number }[]) => {
    // Update position for each todo individually
    const promises = todos.map((todo) =>
      todoApi.update(todo.id, { position: todo.position })
    );
    await Promise.all(promises);
    return { success: true };
  },
};
