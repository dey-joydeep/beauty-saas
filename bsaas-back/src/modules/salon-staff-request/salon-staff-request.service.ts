import {
  PrismaClient,
  SalonStaffRequestType as PrismaSalonStaffRequestType,
  SalonStaffRequestStatus as PrismaSalonStaffRequestStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Use Prisma enums for type safety
type SalonStaffRequestType = PrismaSalonStaffRequestType;
type SalonStaffRequestStatus = PrismaSalonStaffRequestStatus;

export type SalonStaffRequest = {
  id: string;
  staffId: string;
  requestType: SalonStaffRequestType;
  leaveFrom: Date | null;
  leaveTo: Date | null;
  reason: string | null;
  status: SalonStaffRequestStatus;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapSalonStaffRequest(prismaReq: any): SalonStaffRequest {
  return {
    id: prismaReq.id,
    staffId: prismaReq.staffId,
    requestType: prismaReq.requestType,
    leaveFrom: prismaReq.leaveFrom,
    leaveTo: prismaReq.leaveTo,
    reason: prismaReq.reason,
    status: prismaReq.status,
    rejectionReason: prismaReq.rejectionReason,
    createdAt: prismaReq.createdAt,
    updatedAt: prismaReq.updatedAt,
  };
}

export class SalonStaffRequestService {
  async getRequests(filter: Record<string, any>): Promise<SalonStaffRequest[]> {
    const reqs = await prisma.salonStaffRequest.findMany({ where: filter });
    return reqs.map(mapSalonStaffRequest);
  }

  async getRequestById(id: string): Promise<SalonStaffRequest | null> {
    const req = await prisma.salonStaffRequest.findUnique({ where: { id } });
    return req ? mapSalonStaffRequest(req) : null;
  }

  async createRequest(
    data: Omit<SalonStaffRequest, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SalonStaffRequest> {
    const req = await prisma.salonStaffRequest.create({
      data: {
        staffId: data.staffId,
        requestType: data.requestType,
        leaveFrom: data.leaveFrom,
        leaveTo: data.leaveTo,
        reason: data.reason,
        status: data.status,
        rejectionReason: data.rejectionReason,
      },
    });
    return mapSalonStaffRequest(req);
  }

  async updateRequest(
    id: string,
    data: Partial<Omit<SalonStaffRequest, 'id'>>,
  ): Promise<SalonStaffRequest | null> {
    const updateData: any = {};
    if (data.staffId !== undefined) updateData.staffId = data.staffId;
    if (data.requestType !== undefined) updateData.requestType = data.requestType;
    if (data.leaveFrom !== undefined) updateData.leaveFrom = data.leaveFrom;
    if (data.leaveTo !== undefined) updateData.leaveTo = data.leaveTo;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason;
    const req = await prisma.salonStaffRequest.update({ where: { id }, data: updateData });
    return mapSalonStaffRequest(req);
  }

  async deleteRequest(id: string): Promise<boolean> {
    await prisma.salonStaffRequest.delete({ where: { id } });
    return true;
  }
}
