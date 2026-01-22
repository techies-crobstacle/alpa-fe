// app/lib/api.ts

const API_BASE_URL = "https://alpa-be-1.onrender.com/api";

// Generic API client with error handling
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
  isVerified?: boolean;
}

export interface Coupon {
  id?: string;
  _id?: string;
  code: string;
  description?: string;
  discount?: string | number;
}

export interface CartItem {
  id: string;
  qty: number;
  // Add other cart item properties as needed
}

// API endpoints
export const authApi = {
  getProfile: (): Promise<{ user: User }> => apiClient.get("/profile"),
  logout: (): Promise<void> => apiClient.post("/auth/logout"),
};

export const couponsApi = {
  getCoupons: (): Promise<Coupon[]> => {
    return apiClient.get("/admin/coupons").then((data: any) => {
      // Handle different response formats
      return Array.isArray(data) ? data : data.coupons || [];
    });
  },
};

export const cartApi = {
  getCart: (): Promise<{ items: CartItem[] }> => apiClient.get("/cart"),
  // Add more cart endpoints as needed
};

export const productsApi = {
  getAllProducts: (): Promise<{ products: any[] }> => apiClient.get("/products/all"),
  getProduct: (id: string): Promise<any> => apiClient.get(`/products/${id}`),
  // Add more product endpoints as needed
};