import axios from 'axios';
import type { OrderRow } from './orderTypes';
import { clearAuthToken, getAuthToken } from './authToken';

// Base Axios instance matching backend configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

// ── CATEGORIES API ───────────────────────────────────────────────────────────
export const getCategories = async (params?: any) => {
  const { data } = await api.get('/categories', { params });
  return data.data.categories;
};

export const createCategory = async (payload: any) => {
  const { data } = await api.post('/categories', payload);
  return data.data.category;
};

export const updateCategory = async (id: string, payload: any) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data.category;
};

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

// ── COLLECTIONS API ───────────────────────────────────────────────────────────
export const getCollections = async () => {
  const { data } = await api.get('/collections');
  return data.data.collections;
};

// ── PRODUCTS API ──────────────────────────────────────────────────────────────
export const getProducts = async (params?: any) => {
  const { data } = await api.get('/products', { params });
  return data.data.products;
};

export const getProductBySlug = async (slug: string) => {
  const { data } = await api.get(`/products/slug/${slug}`);
  return data.data.product;
};

export const getProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data.product;
};

export const createProduct = async (payload: any) => {
  const { data } = await api.post('/products', payload);
  return data.data.product;
};

export const updateProduct = async (id: string, payload: any) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.data.product;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};

// ── SECTIONS API ──────────────────────────────────────────────────────────────
export const getSections = async () => {
  const { data } = await api.get('/sections');
  return data.data.sections;
};

export const getAllSections = async () => {
  const { data } = await api.get('/sections/manage/all');
  return data.data.sections;
};

export const createSection = async (payload: any) => {
  const { data } = await api.post('/sections', payload);
  return data.data.section;
};

export const updateSection = async (id: string, payload: any) => {
  const { data } = await api.patch(`/sections/${id}`, payload);
  return data.data.section;
};

export const deleteSection = async (id: string) => {
  const { data } = await api.delete(`/sections/${id}`);
  return data;
};

// ── ADMIN API ─────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalCategories: number;
  rootCategories: number;
  homepageSections: number;
  totalStock: number;
  lowStockCount: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
}

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.data as { stats: AdminStats; recentProducts: any[] };
};

// ── REVIEWS API ───────────────────────────────────────────────────────────────
export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title?: string | null;
  review?: string | null;
  status?: string;
  createdAt: string;
  images?: any;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  review?: string;
  images?: string[] | null;
}

export const getProductReviews = async (productId: string) => {
  const { data } = await api.get(`/reviews/product/${productId}`);
  return data.data.reviews as ProductReview[];
};

export const createProductReview = async (payload: CreateReviewPayload) => {
  const { data } = await api.post('/reviews', payload);
  return data.data.review as ProductReview;
};

export const getAllReviewsAdmin = async () => {
  const { data } = await api.get('/reviews');
  return data.data.reviews as (ProductReview & {
    user: { id: string; name: string; email: string; avatar?: string | null };
    product: { id: string; name: string; slug: string };
  })[];
};

export const updateReviewStatusAdmin = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
  const { data } = await api.put(`/reviews/${id}/status`, { status });
  return data.data.review as ProductReview;
};

export const deleteReviewAdmin = async (id: string) => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
};

export interface MyReviewStatus {
  isEligible: boolean;   // user has a DELIVERED order containing this product
  hasReviewed: boolean;  // user already submitted a review
  existingReview: {
    id: string;
    rating: number;
    title?: string | null;
    review?: string | null;
    status: string;
    createdAt: string;
  } | null;
}

export const getMyReviewStatus = async (productId: string): Promise<MyReviewStatus> => {
  const { data } = await api.get(`/reviews/my-status/${productId}`);
  return data.data as MyReviewStatus;
};

// ── ORDERS & PAYMENTS ─────────────────────────────────────────────────────────
export interface CheckoutOrderPayload {
  shippingAddress: Record<string, string>;
  items: Array<{
    productId: string;
    productName: string;
    sku?: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
}

export const createCheckoutOrder = async (payload: CheckoutOrderPayload) => {
  const { data } = await api.post('/orders/checkout', payload);
  return data.data.order as OrderRow;
};

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data.data.orders as OrderRow[];
};

export const getOrderById = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data.order as OrderRow;
};

export const getAllOrdersAdmin = async () => {
  const { data } = await api.get('/orders/admin/all');
  return data.data.orders as OrderRow[];
};

export const updateOrderStatusAdmin = async (
  id: string,
  body: { orderStatus?: string; paymentStatus?: string }
) => {
  const { data } = await api.patch(`/orders/${id}/status`, body);
  return data.data.order as OrderRow;
};

export const cancelOrderCustomer = async (id: string) => {
  const { data } = await api.post(`/orders/${id}/cancel`);
  return data.data.order as OrderRow;
};


export const createRazorpayOrder = async (orderId: string) => {
  const { data } = await api.post('/payment/create-order', { orderId });
  return data.data as {
    razorpayOrder: { id: string; amount: number; currency: string };
    keyId: string;
  };
};

// ── CONTACT API ───────────────────────────────────────────────────────────────
export const submitContactForm = async (payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) => {
  const { data } = await api.post('/contact', payload);
  return data;
};

export const getContactMessagesAdmin = async () => {
  const { data } = await api.get('/contact/admin');
  return data.data.messages;
};

export const updateContactMessageStatus = async (id: string, status: 'NEW' | 'READ') => {
  const { data } = await api.patch(`/contact/${id}/status`, { status });
  return data.data.message;
};

export const deleteContactMessageAdmin = async (id: string) => {
  const { data } = await api.delete(`/contact/${id}`);
  return data;
};

// ── BLOG API ──────────────────────────────────────────────────────────────────
export const getPublishedBlogs = async () => {
  const { data } = await api.get('/blogs');
  return data.data.posts;
};

export const getBlogBySlug = async (slug: string) => {
  const { data } = await api.get(`/blogs/slug/${slug}`);
  return data.data.post;
};

export const getAllBlogsAdmin = async () => {
  const { data } = await api.get('/blogs/manage/all');
  return data.data.posts;
};

export const createBlogPost = async (payload: Record<string, unknown>) => {
  const { data } = await api.post('/blogs', payload);
  return data.data.post;
};

export const updateBlogPost = async (id: string, payload: Record<string, unknown>) => {
  const { data } = await api.put(`/blogs/${id}`, payload);
  return data.data.post;
};

export const deleteBlogPost = async (id: string) => {
  const { data } = await api.delete(`/blogs/${id}`);
  return data;
};

export const verifyRazorpayPayment = async (body: {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) => {
  const { data } = await api.post('/payment/verify', body);
  return data.data as { order: OrderRow | null };
};

// ── BLOG CATEGORIES API ──────────────────────────────────────────────────────
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export const getBlogCategories = async () => {
  const { data } = await api.get('/blogs/categories');
  return data.data.categories as BlogCategory[];
};

export const createBlogCategory = async (payload: { name: string; slug?: string }) => {
  const { data } = await api.post('/blogs/categories', payload);
  return data.data.category as BlogCategory;
};

export const updateBlogCategory = async (id: string, payload: { name?: string; slug?: string }) => {
  const { data } = await api.put(`/blogs/categories/${id}`, payload);
  return data.data.category as BlogCategory;
};

export const deleteBlogCategory = async (id: string) => {
  const { data } = await api.delete(`/blogs/categories/${id}`);
  return data;
};

// ── SETTINGS API ─────────────────────────────────────────────────────────────
export interface SystemSettings {
  cod_allowed: string;
  free_shipping_threshold: string;
  shipping_charge: string;
}

export const getSettings = async () => {
  const { data } = await api.get('/settings');
  return data.data.settings as SystemSettings;
};

export const updateSettings = async (settings: Partial<SystemSettings>) => {
  const { data } = await api.put('/settings', { settings });
  return data.data.settings as SystemSettings;
};

// ── COUPONS API ──────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minimumOrder: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  usageCount?: number;
  startDate: string;
  endDate: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getCouponsAdmin = async () => {
  const { data } = await api.get('/coupons');
  return data.data.coupons as Coupon[];
};

export const createCouponAdmin = async (payload: Partial<Coupon>) => {
  const { data } = await api.post('/coupons', payload);
  return data.data.coupon as Coupon;
};

export const updateCouponAdmin = async (id: string, payload: Partial<Coupon>) => {
  const { data } = await api.put(`/coupons/${id}`, payload);
  return data.data.coupon as Coupon;
};

export const deleteCouponAdmin = async (id: string) => {
  const { data } = await api.delete(`/coupons/${id}`);
  return data;
};

export const applyCoupon = async (code: string, subtotal: number) => {
  const { data } = await api.post('/coupons/apply', { code, subtotal });
  return data.data as { coupon: Coupon; discount: number };
};

export const getActiveCoupons = async () => {
  const { data } = await api.get('/coupons/active');
  return data.data.coupons as Coupon[];
};


