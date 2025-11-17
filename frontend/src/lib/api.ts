const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'creator' | 'student';
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await handleResponse<AuthResponse>(response);
  
  if (data.success && data.token) {
    localStorage.setItem('auth_token', data.token);
    setCookie('auth_token', data.token, 7);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setCookie('user', JSON.stringify(data.user), 7);
    }
  }

  return data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<AuthResponse>(response);
  
  if (result.success && result.token) {
    localStorage.setItem('auth_token', result.token);
    setCookie('auth_token', result.token, 7);
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
      setCookie('user', JSON.stringify(result.user), 7);
    }
  }

  return result;
}

export async function logout(): Promise<{ success: boolean }> {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }

  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  deleteCookie('auth_token');
  deleteCookie('user');
  
  return { success: true };
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await handleResponse<{ success: boolean; user?: User; error?: string }>(response);
    
    if (data.success && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setCookie('user', JSON.stringify(data.user), 7);
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    deleteCookie('auth_token');
    deleteCookie('user');
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

