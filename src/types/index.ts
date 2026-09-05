export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'buyer';
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  _id?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}


export interface Message {
  _id: string;
  text: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  isAdmin: boolean;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Slider {
  _id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  lastMessage: Message;
  messageCount: number;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  name: string;
  _id?: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  mobile: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}