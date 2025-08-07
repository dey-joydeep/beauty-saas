import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
    'apps/bsaas-front/src/app/modules/user/user.component.ts',
    'apps/bsaas-front/src/app/modules/salon/components/staff-request/staff-request-form.component.ts',
    'apps/bsaas-front/src/app/modules/salon/components/salon-profile/salon-profile.component.ts',
    'apps/bsaas-front/src/app/modules/portfolio/portfolio.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/dashboard.service.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/subscription-chart/subscription-chart-widget.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/stats/stats-widget.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart-widget.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/renewals-list/renewals-list-widget.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/product-sales/product-sales-widget.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/widgets/customer-stats/customer-stats-widget.component.ts',
    'apps/bsaas-front/src/app/modules/dashboard/dashboard.component.ts',
    'apps/bsaas-front/src/app/core/auth/components/login/login.component.ts'
];

filesToUpdate.forEach(filePath => {
    try {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const newContent = content.replace(
                /from ['"](?:\.\.\/)+core\/error\.service['"]/g,
                "from '@beauty-saas/frontend/app/core/error/error.service'"
            );

            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated imports in ${filePath}`);
            } else {
                console.log(`No changes needed for ${filePath}`);
            }
        } else {
            console.log(`File not found: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
});

console.log('ErrorService import updates complete.');
