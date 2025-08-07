import { PrismaClient } from '@prisma/client';
import type { 
  GetPortfolioByIdParams, 
  CreatePortfolioParams, 
  UpdatePortfolioParams,
  DeletePortfolioParams,
  PortfolioData
} from './portfolio-params.model';

// Response types
interface PortfolioResponse {
  id: string;
  tenantId: string;
  salonId: string;
  userId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    portfolioId: string;
    imagePath: string;
    createdAt: string;
  }>;
}

const prisma = new PrismaClient();

/**
 * Service for handling portfolio-related operations
 */
export class PortfolioService {
  /**
   * Get a portfolio by ID
   * @param params The parameters including the portfolio ID and optional user ID for ownership validation
   * @returns The portfolio with its images or null if not found
   */
  async getPortfolioById(params: GetPortfolioByIdParams): Promise<PortfolioResponse | null> {
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

  /**
   * Create a new portfolio
   * @param params The parameters including the portfolio data and user ID
   * @returns The created portfolio with its images
   */
  async createPortfolio(params: CreatePortfolioParams): Promise<PortfolioResponse> {
    const { data, userId } = params;
    
    if (!data.images || data.images.length === 0) {
      throw new Error('At least one image is required');
    }
    
    if (!data.description || !data.description.trim()) {
      throw new Error('Description is required');
    }
    
    // Ensure the user ID in the data matches the authenticated user
    if (data.userId !== userId) {
      throw new Error('Unauthorized to create portfolio for another user');
    }
    
    // Create the portfolio with its images
    const portfolio = await prisma.portfolio.create({
      data: {
        tenantId: data.tenantId,
        salonId: data.salonId,
        userId: data.userId,
        description: data.description,
        images: {
          create: data.images.map(img => ({ 
            imagePath: typeof img === 'string' ? img : img.imagePath 
          })),
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

  /**
   * Update an existing portfolio
   * @param params The parameters including the portfolio ID, update data, and user ID
   * @returns The updated portfolio with its images
   */
  async updatePortfolio(params: UpdatePortfolioParams): Promise<PortfolioResponse> {
    const { id, data, userId } = params;
    
    // Verify the portfolio exists and belongs to the user
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id },
      select: { userId: true }
    });
    
    if (!existingPortfolio) {
      throw new Error('Portfolio not found');
    }
    
    if (existingPortfolio.userId !== userId) {
      throw new Error('Unauthorized to update this portfolio');
    }
    
    // Validate description if provided
    if ('description' in data && (!data.description || !data.description.trim())) {
      throw new Error('Description cannot be empty');
    }
    
    // Update the portfolio
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...data,
        // Only update images if provided
        ...(data.images ? {
          images: {
            deleteMany: {},
            create: data.images.map(img => ({
              imagePath: typeof img === 'string' ? img : img.imagePath
            })),
          }
        } : {})
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

  /**
   * Delete a portfolio
   * @param params The parameters including the portfolio ID and user ID
   * @returns True if the portfolio was deleted successfully
   */
  async deletePortfolio(params: DeletePortfolioParams): Promise<boolean> {
    const { id, userId } = params;
    
    // Verify the portfolio exists and belongs to the user
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { id },
      select: { userId: true }
    });
    
    if (!existingPortfolio) {
      throw new Error('Portfolio not found');
    }
    
    if (existingPortfolio.userId !== userId) {
      throw new Error('Unauthorized to delete this portfolio');
    }
    
    // Delete the portfolio (Prisma's cascading deletes will handle related images)
    await prisma.portfolio.delete({ where: { id } });
    return true;
  }
}
