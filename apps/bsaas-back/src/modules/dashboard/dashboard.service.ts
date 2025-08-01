import { PrismaClient, Prisma } from '@prisma/client';
import {
  ProductSalesFilterDto,
  ProductSaleDto,
  ProductSalesSummaryDto,
  SalesByProductDto,
  SalesByDateDto,
} from './dto/product-sales.dto';

const prisma = new PrismaClient();

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export class DashboardService {
  async getStats() {
    // Fetch total counts with proper typing
    const [userCount, salonCount, appointmentCount, reviewCount, /* productCount,*/ saleCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.salon.count(),
        prisma.appointment.count(),
        prisma.review.count(),
        // prisma.product.count(),
        prisma.productSale.count(),
      ]);

    // Calculate total revenue from product sales
    const revenueResult = await prisma.productSale.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    return {
      userCount,
      salonCount,
      appointmentCount,
      reviewCount,
      // productCount,
      saleCount,
      totalRevenue: revenueResult._sum.totalAmount || 0,
    };
  }

  async getSubscriptions() {
    // Since we don't have a Subscription model, we'll return an empty array
    // In a real app, you would query your subscription data here
    return [];
  }

  async getRevenue() {
    // Get revenue from product sales for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await prisma.productSale.groupBy({
      by: ['saleDate'],
      where: {
        saleDate: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        saleDate: 'asc',
      },
    });

    return result.map((item: { saleDate: Date; _sum: { totalAmount: number | null } }) => ({
      month: item.saleDate,
      revenue: item._sum.totalAmount || 0,
    }));
  }

  async getProductSales(filters?: ProductSalesFilterDto): Promise<ProductSaleDto[]> {
    const { startDate, endDate, productId, soldById, customerId } = filters || {};

    const where: any = {
      ...(startDate && { saleDate: { gte: new Date(startDate) } }),
      ...(endDate && { saleDate: { lte: new Date(endDate) } }),
      ...(productId && { productId }),
      ...(soldById && { soldById }),
      ...(customerId && { customerId }),
    };

    const sales = await prisma.productSale.findMany({
      where,
      include: {
        // product: {
        //   select: { name: true },
        // },
        soldBy: {
          select: { name: true },
        },
        customer: {
          select: { name: true },
        },
      },
      orderBy: {
        saleDate: 'desc',
      },
    });

    return sales.map((sale: any) => ({
      id: sale.id,
      productId: sale.productId,
      productName: sale.product.name,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      saleDate: sale.saleDate,
      soldById: sale.soldById,
      soldByName: sale.soldBy.name,
      customerId: sale.customerId || undefined,
      customerName: sale.customer?.name,
      appointmentId: sale.appointmentId || undefined,
      notes: sale.notes || undefined,
    }));
  }

  // Format date to YYYY-MM-DD for UI display
  private formatDateForUI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async getProductSalesSummary(filters?: ProductSalesFilterDto): Promise<ProductSalesSummaryDto> {
    const sales = await this.getProductSales(filters);

    // Calculate summary metrics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Group sales by product
    const salesByProduct = sales.reduce<Record<string, SalesByProductDto>>((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          productId: sale.productId,
          productName: sale.productName,
          quantity: 0,
          revenue: 0,
          percentage: 0,
        };
      }
      acc[sale.productId].quantity += sale.quantity;
      acc[sale.productId].revenue += sale.totalAmount;
      return acc;
    }, {});

    // Calculate percentages
    Object.values(salesByProduct).forEach((product) => {
      product.percentage = (product.revenue / totalRevenue) * 100;
    });

    // Group sales by date
    const salesByDate = sales.reduce<Record<string, SalesByDateDto>>(
      (acc: Record<string, SalesByDateDto>, sale: ProductSaleDto) => {
        const date = this.formatDateForUI(sale.saleDate);
        if (!acc[date]) {
          acc[date] = { date, sales: 0, items: 0 };
        }
        acc[date].sales += sale.totalAmount;
        acc[date].items += sale.quantity;
        return acc;
      },
      {},
    );

    // Convert to arrays and sort
    const productSales = Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue);
    const dateSales = Object.values(salesByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate cost and profit (this is a simplified example)
    // In a real app, you'd fetch the actual cost from the database
    const totalCost = sales.reduce((sum, sale) => {
      // Assuming a 60% profit margin for this example
      return sum + sale.totalAmount * 0.4;
    }, 0);

    const totalProfit = totalRevenue - totalCost;

    return {
      totalSales,
      totalRevenue,
      totalCost,
      totalProfit,
      totalItemsSold,
      averageSaleValue,
      salesByProduct: productSales,
      salesByDate: dateSales,
    };
  }

  async getTopSellingProducts(limit: number = 5): Promise<SalesByProductDto[]> {
    const sales = await this.getProductSales();

    const products = sales.reduce<Record<string, SalesByProductDto>>(
      (acc: Record<string, SalesByProductDto>, sale: ProductSaleDto) => {
        if (!acc[sale.productId]) {
          acc[sale.productId] = {
            productId: sale.productId,
            productName: sale.productName,
            quantity: 0,
            revenue: 0,
            percentage: 0,
          };
        }
        acc[sale.productId].quantity += sale.quantity;
        acc[sale.productId].revenue += sale.totalAmount;
        return acc;
      },
      {},
    );

    return Object.values(products)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async getRenewals() {
    // Example: list upcoming salon renewals (assume renewal_date on Salon)
    const now = new Date();
    const soon = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // next 30 days
    const results = await prisma.salon.findMany({
      where: {
        renewalDate: {
          // Use camelCase for Prisma Client
          gte: now,
          lte: soon,
        },
      },
      select: {
        name: true,
        renewalDate: true, // Use camelCase for Prisma Client
      },
      orderBy: {
        renewalDate: 'asc', // Use camelCase for Prisma Client
      },
    });
    return results.map((r) => ({ salonName: r.name, renewalDate: r.renewalDate })); // Use camelCase for output
  }
}
