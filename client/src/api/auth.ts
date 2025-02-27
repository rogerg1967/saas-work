import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface Organization {
  name: string;
  industry?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  organization?: Organization;
  role?: 'admin' | 'organization_manager' | 'team_member';
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      name: string;
      role: string;
      organizationId?: string;
      isActive: boolean;
      createdAt: string;
      lastLoginAt: string;
    };
    organization?: {
      _id: string;
      name: string;
      industry: string;
      status: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

// Description: Log in a user
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, data: { user: User, accessToken: string, refreshToken: string } }
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Make sure data is properly structured
    if (!data || typeof data !== 'object') {
      console.error('Invalid login data format:', data);
      throw new Error('Invalid login data format');
    }

    if (!data.email || !data.password) {
      console.error('Missing login credentials:', { email: !!data.email, password: !!data.password });
      throw new Error('Email and password are required');
    }

    console.log('Request: post /api/auth/login', data.email);

    const response = await api.post('/api/auth/login', {
      email: data.email,
      password: data.password
    });

    // Store tokens in localStorage
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }

    return response.data;
  } catch (error: any) {
    console.error('Response error:', error.response?.status, error.response?.data?.message || 'There was an error serving your request.');
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Register a new user
// Endpoint: POST /api/auth/register
// Request: {
//   email: string,
//   password: string,
//   name?: string,
//   organization?: { name: string, industry?: string },
//   role?: string
// }
// Response: { success: boolean, data: { user: User, organization?: Organization, accessToken: string, refreshToken: string } }
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Ensure data is an object with email and password
    if (typeof data === 'string') {
      console.error('Invalid data format: Expected object, got string:', data);
      throw new Error('Invalid registration data format');
    }

    if (!data.email || !data.password) {
      console.error('Missing required registration fields:', data);
      throw new Error('Email and password are required');
    }

    console.log('Sending registration request with data:', JSON.stringify(data));
    const response = await api.post('/api/auth/register', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Store only accessToken in localStorage as per requirements
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }

    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Log out a user
// Endpoint: POST /api/auth/logout
// Request: { email: string }
// Response: { success: boolean, message: string }
export const logout = async (email: string) => {
  try {
    const response = await api.post('/api/auth/logout', { email });

    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    return response.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};