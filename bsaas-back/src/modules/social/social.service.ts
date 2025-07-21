import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Social = {
  id: string;
  userId: string;
  platform: string;
  handle: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GetSocialByIdParams = {
  id: string;
};

export type UpdateSocialParams = {
  id: string;
  data: Partial<Omit<Social, 'id'>>;
};

export type DeleteSocialParams = {
  id: string;
};

function mapSocial(prismaSocial: any): Social {
  return {
    id: prismaSocial.id,
    userId: prismaSocial.user_id,
    platform: prismaSocial.platform,
    handle: prismaSocial.handle,
    url: prismaSocial.url,
    createdAt: prismaSocial.created_at,
    updatedAt: prismaSocial.updated_at,
  };
}

export class SocialService {
  async getSocials(filter: Record<string, any>): Promise<Social[]> {
    const socials = await prisma.social.findMany({ where: filter });
    return socials.map(mapSocial);
  }

  async getSocialById(params: GetSocialByIdParams): Promise<Social | null> {
    const social = await prisma.social.findUnique({ where: { id: params.id } });
    return social ? mapSocial(social) : null;
  }

  async createSocial(data: Omit<Social, 'id' | 'createdAt' | 'updatedAt'>): Promise<Social> {
    const social = await prisma.social.create({
      data: {
        userId: data.userId,
        platform: data.platform,
        handle: data.handle,
        url: data.url,
      },
    });
    return mapSocial(social);
  }

  async updateSocial(params: UpdateSocialParams): Promise<Social | null> {
    const updateData: any = {};
    if (params.data.userId !== undefined) updateData.userId = params.data.userId;
    if (params.data.platform !== undefined) updateData.platform = params.data.platform;
    if (params.data.handle !== undefined) updateData.handle = params.data.handle;
    if (params.data.url !== undefined) updateData.url = params.data.url;
    const social = await prisma.social.update({ where: { id: params.id }, data: updateData });
    return mapSocial(social);
  }

  async deleteSocial(params: DeleteSocialParams): Promise<boolean> {
    await prisma.social.delete({ where: { id: params.id } });
    return true;
  }
}
