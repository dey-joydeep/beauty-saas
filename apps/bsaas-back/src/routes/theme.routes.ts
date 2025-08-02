import { Router } from 'express';
import { getThemes, updateTheme } from '../modules/theme/theme.controller';
import { authenticateJWT } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateThemeSchema } from '../validators/theme.validator';

const router = Router();

// Get current tenant theme
router.get('/:tenantId', getThemes);
// Update theme (business only)
router.put('/:tenantId', updateTheme);

export default router;
