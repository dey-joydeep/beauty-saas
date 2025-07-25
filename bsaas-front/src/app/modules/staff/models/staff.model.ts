export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  portfolioUrl?: string;
  isActive: boolean;
  contact: string;
  nickname?: string;
}
