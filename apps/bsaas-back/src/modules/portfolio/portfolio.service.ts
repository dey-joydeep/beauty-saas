import { PrismaClient } from '@prisma/client';
import type { GetPortfolioByIdParams } from './portfolio-params.model';

const prisma = new PrismaClient();

export class PortfolioService {
  async getPortfolioById(params: GetPortfolioByIdParams): Promise<any> {
    const p = await prisma.portfolio.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
    if (!p) return null;
    return {
      id: p.id,
      tenantId: p.tenantId,
      salonId: p.salonId,
      userId: p.userId,
      description: p.description ?? null,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
      updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
      images: (p.images ?? []).map((img: any) => ({
        id: img.id,
        portfolioId: img.portfolioId,
        imagePath: img.imagePath,
        createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
      })),
    };
  }

  async createPortfolio({ data }: { data: any }): Promise<any> {
    if (!data.images) throw new Error('Image(s) required');
    if (!data.description || !data.description.trim()) throw new Error('Description required');
    // Real DB insert
    const portfolio = await prisma.portfolio.create({
      data: {
        tenantId: data.tenantId,
        salonId: data.salonId,
        userId: data.userId,
        description: data.description,
        images: {
          create: data.images.map((img: any) => ({ imagePath: img.imagePath })),
        },
      },
      include: { images: true },
    });
    return {
      id: portfolio.id,
      tenantId: portfolio.tenantId,
      salonId: portfolio.salonId,
      userId: portfolio.userId,
      description: portfolio.description ?? null,
      createdAt:
        portfolio.createdAt instanceof Date
          ? portfolio.createdAt.toISOString()
          : portfolio.createdAt,
      updatedAt:
        portfolio.updatedAt instanceof Date
          ? portfolio.updatedAt.toISOString()
          : portfolio.updatedAt,
      images: (portfolio.images ?? []).map((img: any) => ({
        id: img.id,
        portfolioId: img.portfolioId,
        imagePath: img.imagePath,
        createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
      })),
    };
  }

  async updatePortfolio({ id, data }: { id: string; data: any }): Promise<any> {
    if ('description' in data && (!data.description || !data.description.trim()))
      throw new Error('Description required');
    // Real DB update
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...data,
        images: data.images
          ? {
              deleteMany: {},
              create: data.images.map((img: any) => ({ imagePath: img.imagePath })),
            }
          : undefined,
      },
      include: { images: true },
    });
    return {
      id: portfolio.id,
      tenantId: portfolio.tenantId,
      salonId: portfolio.salonId,
      userId: portfolio.userId,
      description: portfolio.description ?? null,
      createdAt:
        portfolio.createdAt instanceof Date
          ? portfolio.createdAt.toISOString()
          : portfolio.createdAt,
      updatedAt:
        portfolio.updatedAt instanceof Date
          ? portfolio.updatedAt.toISOString()
          : portfolio.updatedAt,
      images: (portfolio.images ?? []).map((img: any) => ({
        id: img.id,
        portfolioId: img.portfolioId,
        imagePath: img.imagePath,
        createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
      })),
    };
  }

  async deletePortfolio(id: string): Promise<boolean> {
    await prisma.portfolio.delete({ where: { id } });
    return true;
  }
}
