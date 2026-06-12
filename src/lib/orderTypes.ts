export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};


export interface OrderItemRow {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image: string | null;
  quantity: number;
  price: number | string;
  reviewRating?: number | null;
}

export interface OrderPaymentRow {
  id: string;
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  amount: number | string;
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  subtotal: number | string;
  discount: number | string;
  shipping: number | string;
  tax: number | string;
  total: number | string;
  paymentStatus: string;
  orderStatus: OrderStatus | string;
  shippingAddress: Record<string, unknown>;
  billingAddress?: Record<string, unknown> | null;
  notes?: string | null;
  placedAt: string;
  createdAt: string;
  items: OrderItemRow[];
  payments?: OrderPaymentRow[];
  user?: { id: string; name: string; email: string; phone?: string | null };
}
