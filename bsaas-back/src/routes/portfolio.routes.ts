import { Router } from 'express';
import * as portfolioController from '../modules/portfolio/portfolio.controller';

const router = Router();

// Portfolio CRUD
router.get('/', ...portfolioController.getPortfolios);
router.get('/:id', ...portfolioController.getPortfolioById);
router.post('/', ...portfolioController.createPortfolio);
router.put('/:id', ...portfolioController.updatePortfolio);
router.delete('/:id', ...portfolioController.deletePortfolio);

export default router;
