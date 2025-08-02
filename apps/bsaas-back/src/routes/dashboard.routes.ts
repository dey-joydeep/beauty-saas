import { Router } from 'express';
import {
  getDashboardStats,
  getSubscriptions,
  getRevenue,
  getProductSales,
  getProductSalesSummary,
  getTopSellingProducts,
  getRenewals,
} from '../modules/dashboard/dashboard.controller';

const router = Router();

// Dashboard stats
router.get('/stats', getDashboardStats);

// Product sales related endpoints
router.get('/product-sales', getProductSales);
router.get('/product-sales/summary', getProductSalesSummary);
router.get('/product-sales/top-selling', getTopSellingProducts);

// Other dashboard endpoints
router.get('/subscriptions', getSubscriptions);
router.get('/revenue', getRevenue);
router.get('/renewals', getRenewals);

export default router;
