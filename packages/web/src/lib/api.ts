import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any authentication tokens here if needed
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access (redirect to login)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Organizations
  getOrganizations(page = 1, limit = 10) {
    return this.client.get(`/organizations?page=${page}&limit=${limit}`);
  }

  getOrganization(id: string) {
    return this.client.get(`/organizations/${id}`);
  }

  createOrganization(data: any) {
    return this.client.post('/organizations', data);
  }

  updateOrganization(id: string, data: any) {
    return this.client.patch(`/organizations/${id}`, data);
  }

  deleteOrganization(id: string) {
    return this.client.delete(`/organizations/${id}`);
  }

  // Employees
  getEmployees(organizationId: string, page = 1, limit = 50) {
    return this.client.get(
      `/organizations/${organizationId}/employees?page=${page}&limit=${limit}`
    );
  }

  getActiveEmployees(organizationId: string) {
    return this.client.get(`/organizations/${organizationId}/employees/active`);
  }

  getEmployee(organizationId: string, employeeId: string) {
    return this.client.get(`/organizations/${organizationId}/employees/${employeeId}`);
  }

  createEmployee(organizationId: string, data: any) {
    return this.client.post(`/organizations/${organizationId}/employees`, data);
  }

  updateEmployee(organizationId: string, employeeId: string, data: any) {
    return this.client.patch(`/organizations/${organizationId}/employees/${employeeId}`, data);
  }

  deactivateEmployee(organizationId: string, employeeId: string) {
    return this.client.post(
      `/organizations/${organizationId}/employees/${employeeId}/deactivate`
    );
  }

  reactivateEmployee(organizationId: string, employeeId: string) {
    return this.client.post(
      `/organizations/${organizationId}/employees/${employeeId}/reactivate`
    );
  }

  deleteEmployee(organizationId: string, employeeId: string) {
    return this.client.delete(`/organizations/${organizationId}/employees/${employeeId}`);
  }

  // Generic methods
  get(url: string) {
    return this.client.get(url);
  }

  post(url: string, data: any) {
    return this.client.post(url, data);
  }

  patch(url: string, data: any) {
    return this.client.patch(url, data);
  }

  delete(url: string) {
    return this.client.delete(url);
  }
}

const api = new ApiClient();
export default api;
