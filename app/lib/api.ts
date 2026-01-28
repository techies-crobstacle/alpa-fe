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
    console.log(`API POST to ${endpoint}:`, data);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await this.handleResponse<T>(response);
    console.log(`API POST ${endpoint} response:`, result);
    return result;
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
  getMyCart: (): Promise<{ cart: any[] }> => apiClient.get("/cart/my-cart"),
  addToCart: (data: { productId: string; quantity: number }): Promise<any> => 
    apiClient.post("/cart/add", data),
  updateCart: (data: { productId: string; quantity: number }): Promise<any> => 
    apiClient.put("/cart/update", data),
  removeFromCart: (productId: string): Promise<any> => 
    apiClient.delete(`/cart/remove/${productId}`),
};

export const wishlistApi = {
  getWishlist: (): Promise<any[]> => apiClient.get("/wishlist"),
  checkWishlist: (productId: string | number): Promise<{ inWishlist: boolean }> =>
    apiClient.get(`/wishlist/check/${productId}`),
  addToWishlist: (data: { productId: string | number }): Promise<any> => {
    console.log("API: Trying multiple wishlist endpoints for productId:", data.productId);
    
    // Try the most common patterns for wishlist APIs
    const attempts = [
      () => apiClient.post("/wishlist", { productId: data.productId }),
      () => apiClient.put("/wishlist", { productId: data.productId }),
      () => apiClient.post("/user/wishlist", { productId: data.productId }),
      () => apiClient.post("/wishlist/items", { productId: data.productId }),
      () => apiClient.put(`/wishlist/${data.productId}`, {}),
      () => apiClient.post(`/wishlist/${data.productId}`, {}),
      // Some APIs expect the product ID in the URL path
      () => apiClient.get(`/wishlist/add/${data.productId}`),
      // Or as query parameter
      () => apiClient.post(`/wishlist/add?productId=${data.productId}`, {})
    ];
    
    let lastError: unknown;
    
    const tryEndpoint = async (index = 0): Promise<any> => {
      if (index >= attempts.length) {
        console.error("All wishlist endpoints failed. Last error:", lastError);
        let errorMsg = "";
        if (lastError && typeof lastError === "object" && "message" in lastError) {
          errorMsg = (lastError as any).message;
        } else {
          errorMsg = String(lastError);
        }
        throw new Error(`All wishlist endpoints failed. Available endpoints might be different. Last error: ${errorMsg}`);
      }
      
      try {
        console.log(`Trying wishlist endpoint ${index + 1}/${attempts.length}`);
        const result = await attempts[index]();
        console.log(`Wishlist endpoint ${index + 1} succeeded:`, result);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`Wishlist endpoint ${index + 1} failed:`, error);
        return tryEndpoint(index + 1);
      }
    };
    
    return tryEndpoint();
  },
  removeFromWishlist: (productId: string): Promise<any> => 
    apiClient.delete(`/wishlist/${productId}`)
      .catch(() => apiClient.delete(`/wishlist/remove/${productId}`)),
};

export const productsApi = {
  getAllProducts: (): Promise<{ products: any[] }> => apiClient.get("/products/all"),
  getProduct: (id: string): Promise<any> => apiClient.get(`/products/${id}`),
  // Add more product endpoints as needed
};