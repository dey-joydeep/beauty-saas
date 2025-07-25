export interface DashboardStats {
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  count: number;
  newCustomers?: number;
  returningCustomers?: number;
  activeCustomers?: number;
  churnedCustomers?: number;
  mrr?: number;
  arr?: number;
}

export interface RevenueData {
  date: string;
  amount: number;
}

export interface AppointmentTrend {
  date: string;
  count: number;
}


export interface Renewal {
  id: string;
  customerId: string;
  customerName: string;
  subscriptionId: string;
  serviceName: string;
  renewalDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSales {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface SubscriptionData {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  month: string;
  retentionRate: number;
}
