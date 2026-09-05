import { api } from './api';
import { Order } from '@/types';

export const orderService = {
  async getMyOrders(): Promise<Order[]> {
    return api.getMyOrders();
  },

  async getAllOrders(status?: string, page?: number, limit?: number) {
    return api.getAllOrders(status, page, limit);
  },

  async getOrder(id: string): Promise<Order> {
    return api.getOrder(id);
  },

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
    return api.createOrder(orderData);
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return api.updateOrderStatus(orderId, status);
  },

  async cancelOrder(orderId: string): Promise<Order> {
    return api.cancelOrder(orderId);
  },

  async getOrderStats() {
    return api.getOrderStats();
  },

  async adminCancelOrder(orderId: string): Promise<Order> {
    return api.adminCancelOrder(orderId);
  },

  async cleanupOldOrders(): Promise<{ message: string; deletedCount: number }> {
    return api.cleanupOldOrders();
  }
};