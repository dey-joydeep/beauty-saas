export interface SaveStaffParams {
  name: string;
  email: string;
  contact: string;
  nickname?: string;
  profilePicture?: File | null;
}

export interface StaffParams {
  id?: string;
  name: string;
  email: string;
  role: string;
  approved?: boolean;
  portfolioUrl?: string;
  isActive?: boolean;
  contact?: string;
  nickname?: string;
  salonId?: string;
}
