export interface Renewal {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  status: 'pending' | 'completed' | 'overdue';
  amount: number;
  subscriptionId: string;
}
