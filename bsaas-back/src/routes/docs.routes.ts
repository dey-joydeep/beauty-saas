import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();
const openapiPath = path.join(__dirname, '../docs/openapi.json');
const openapiDoc = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

router.use('/', swaggerUi.serve, swaggerUi.setup(openapiDoc));

export default router;
