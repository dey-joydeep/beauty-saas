export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: Role[];
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  saasOwner?: any;
  salonStaff?: any;
  customer?: any;
}
