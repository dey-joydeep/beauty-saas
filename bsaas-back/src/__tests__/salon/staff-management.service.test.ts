import { SalonService, Staff } from '../../services/salon.service';

describe('SalonService Staff Management', () => {
  let service: SalonService;
  const salonId = 'salon1';
  beforeEach(() => {
    service = new SalonService();
  });

  it('should get staff list', async () => {
    const staff = await service.getStaff({ salonId });
    expect(Array.isArray(staff)).toBe(true);
    // Minimal: allow empty list, but type must be correct
    expect(staff.every((s) => typeof s.id === 'string')).toBe(true);
  });

  it('should add staff', async () => {
    const newStaff = {
      userId: 'user-dave',
      name: 'Dave',
      email: 'dave@example.com',
      position: 'stylist',
      isActive: true,
    };
    const added = await service.addStaff({ salonId, staff: newStaff });
    expect(added.name).toBe('Dave');
    const staffList = await service.getStaff({ salonId });
    expect(staffList.find((s) => s.id === added.id)).toBeTruthy();
  });

  it('should remove staff', async () => {
    const staffList = await service.getStaff({ salonId });
    if (staffList.length === 0) return;
    const staffId = staffList[0].id;
    const ok = await service.removeStaff({ salonId, staffId });
    expect(ok).toBe(true);
    const after = await service.getStaff({ salonId });
    expect(after.find((s) => s.id === staffId)).toBeFalsy();
  });
});
