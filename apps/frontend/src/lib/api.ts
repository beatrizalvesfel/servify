// Detect subdomain and construct API URL
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  }
  
  const host = window.location.host;
  
  // If accessing via subdomain (e.g., empresa1.localhost:3000)
  if (host.includes('.localhost')) {
    const subdomain = host.split('.')[0];
    const apiUrl = `http://${subdomain}.localhost:3001/api/v1`;
    console.log('🌐 API URL detected:', apiUrl);
    return apiUrl;
  }
  
  // Default fallback
  const defaultUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  console.log('🌐 API URL default:', defaultUrl);
  return defaultUrl;
};

const API_URL = getApiUrl();

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
  };
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/profile', {
      method: 'POST',
    });
  }

  async logout(): Promise<any> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Services API
  async getServices(): Promise<any[]> {
    return this.request('/services');
  }

  async createService(data: any): Promise<any> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: any): Promise<any> {
    return this.request(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string): Promise<any> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Professionals API
  async getProfessionals(): Promise<any[]> {
    return this.request('/professionals');
  }

  async createProfessional(data: any): Promise<any> {
    return this.request('/professionals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfessional(id: string, data: any): Promise<any> {
    return this.request(`/professionals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProfessional(id: string): Promise<any> {
    return this.request(`/professionals/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments API
  async getAppointments(filters?: any): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value as string);
      });
    }
    const query = queryParams.toString();
    return this.request(`/appointments${query ? `?${query}` : ''}`);
  }

  async createAppointment(data: any): Promise<any> {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: any): Promise<any> {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string): Promise<any> {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAppointmentStatus(id: string, status: string): Promise<any> {
    return this.request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAvailableSlots(professionalId: string, serviceId: string, date: string): Promise<any[]> {
    return this.request(`/appointments/available-slots?professionalId=${professionalId}&serviceId=${serviceId}&date=${date}`);
  }
}

export const apiClient = new ApiClient();
