import { User, Slider, Message, Conversation, Product, Category, Cart, Order } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LoginCredentials {
    username: string;
    password: string;
}

interface SignupCredentials {
    username: string;
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

interface SendMessageData {
    text: string;
    conversationId?: string;
    isAdminReply?: boolean;
}

interface GuestMessageData {
    text: string;
    guestName: string;
    guestEmail: string;
}

interface CreateProductData {
    name: string;
    description: string;
    price: string;
    category: string;
    stock: string;
    featured: boolean;
}


class ApiService {
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        const data = await response.json();
        return data;
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Auth methods
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async signup(credentials: SignupCredentials): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async getCurrentUser(): Promise<{ user: User }> {
        return this.request<{ user: User }>('/auth/me');
    }

    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.removeToken();
        }
    }

    // Admin methods - Users
    async getUsers(): Promise<User[]> {
        return this.request<User[]>('/users');
    }

    async deleteUser(userId: string): Promise<void> {
        await this.request(`/users/${userId}`, {
            method: 'DELETE',
        });
    }

    // Sliders management
    async getSliders(): Promise<Slider[]> {
        return this.request<Slider[]>('/sliders');
    }

    async getActiveSliders(): Promise<Slider[]> {
        return this.request<Slider[]>('/sliders/active');
    }

    async createSlider(formData: FormData): Promise<Slider> {
        const response = await fetch(`${API_BASE_URL}/sliders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    }

    async updateSlider(id: string, formData: FormData): Promise<Slider> {
        const response = await fetch(`${API_BASE_URL}/sliders/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    }

    async deleteSlider(id: string): Promise<void> {
        await this.request(`/sliders/${id}`, {
            method: 'DELETE',
        });
    }

    async updateSliderOrder(id: string, order: number): Promise<Slider> {
        return this.request<Slider>(`/sliders/${id}/order`, {
            method: 'PATCH',
            body: JSON.stringify({ order }),
        });
    }

    // Chat methods
    async getConversations(): Promise<Conversation[]> {
        return this.request<Conversation[]>('/chat/conversations');
    }

    async getConversationMessages(conversationId: string): Promise<Message[]> {
        return this.request<Message[]>(`/chat/conversation/${conversationId}`);
    }

    async sendMessage(data: SendMessageData): Promise<Message> {
        return this.request<Message>('/chat/message', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async sendGuestMessage(data: GuestMessageData): Promise<Message> {
        const response = await fetch(`${API_BASE_URL}/chat/guest-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    }

    async getGuestMessages(email: string): Promise<Message[]> {
        const response = await fetch(`${API_BASE_URL}/chat/guest-conversation/${encodeURIComponent(email)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    }

    async deleteConversation(conversationId: string): Promise<void> {
        await this.request(`/chat/conversation/${conversationId}`, {
            method: 'DELETE',
        });
    }

    // Product methods
    async getProducts(category?: string, featured?: boolean, search?: string): Promise<Product[]> {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (featured) params.append('featured', 'true');
        if (search) params.append('search', search);

        const query = params.toString();
        return this.request<Product[]>(`/products${query ? `?${query}` : ''}`);
    }

    async getFeaturedProducts(): Promise<Product[]> {
        return this.request<Product[]>('/products/featured');
    }

    async getProduct(id: string): Promise<Product> {
        return this.request<Product>(`/products/${id}`);
    }

    async createProduct(formData: FormData): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    }

    async updateProduct(id: string, formData: FormData): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong' }));
            throw new Error(errorData.message || 'Something went wrong');
        }

        return response.json();
    }

    async deleteProduct(id: string): Promise<void> {
        await this.request(`/products/${id}`, {
            method: 'DELETE',
        });
    }

    async getCategories(): Promise<Category[]> {
        return this.request<Category[]>('/categories');
    }

    async getCategory(id: string): Promise<Category> {
        return this.request<Category>(`/categories/${id}`);
    }

    async createCategory(name: string, description: string): Promise<Category> {
        return this.request<Category>('/categories', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });
    }

    async updateCategory(id: string, name: string, description: string): Promise<Category> {
        return this.request<Category>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, description }),
        });
    }

    async deleteCategory(id: string): Promise<void> {
        await this.request(`/categories/${id}`, {
            method: 'DELETE',
        });
    }

    // Cart methods
    async getCart(): Promise<Cart> {
        return this.request<Cart>('/cart');
    }

    async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
        return this.request<Cart>('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    }

    async updateCartItem(productId: string, quantity: number): Promise<Cart> {
        return this.request<Cart>(`/cart/items/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    }

    async removeFromCart(productId: string): Promise<Cart> {
        return this.request<Cart>(`/cart/items/${productId}`, {
            method: 'DELETE',
        });
    }

    async clearCart(): Promise<{ message: string }> {
        return this.request<{ message: string }>('/cart/clear', {
            method: 'DELETE',
        });
    }
    
    async getCartCount(): Promise<{ count: number }> {
        return this.request<{ count: number }>('/cart/count');
    }

    // Order methods
async createOrder(orderData: {
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    mobile: string;
  };
  paymentMethod?: string;
}): Promise<Order> {
  return this.request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

async getMyOrders(): Promise<Order[]> {
  return this.request<Order[]>('/orders/my-orders');
}

async getOrder(id: string): Promise<Order> {
  return this.request<Order>(`/orders/${id}`);
}

// Admin order methods
async getAllOrders(status?: string, page?: number, limit?: number): Promise<{
  orders: Order[];
  totalPages: number;
  currentPage: number;
  total: number;
}> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const query = params.toString();
  return this.request<{ orders: Order[]; totalPages: number; currentPage: number; total: number }>(
    `/orders${query ? `?${query}` : ''}`
  );
}

async updateOrderStatus(orderId: string, status: string): Promise<Order> {
  return this.request<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

async cancelOrder(orderId: string): Promise<Order> {
  return this.request<Order>(`/orders/${orderId}/cancel`, {
    method: 'PATCH',
  });
}


async adminCancelOrder(orderId: string): Promise<Order> {
  return this.request<Order>(`/orders/${orderId}/admin-cancel`, {
    method: 'PATCH',
  });
}

async cleanupOldOrders(): Promise<{ message: string; deletedCount: number }> {
  return this.request<{ message: string; deletedCount: number }>('/orders/cleanup', {
    method: 'DELETE',
  });
}

async getOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}> {
  return this.request('/orders/stats/overview');
}
}

export const api = new ApiService();