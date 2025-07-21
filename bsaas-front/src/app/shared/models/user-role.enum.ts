export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OWNER = 'owner',
  STAFF = 'staff',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.OWNER]: 'Salon Owner',
  [UserRole.STAFF]: 'Staff Member',
  [UserRole.CUSTOMER]: 'Customer',
  [UserRole.GUEST]: 'Guest',
};

export const StaffRoles = [UserRole.OWNER, UserRole.STAFF];

export const AdminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
