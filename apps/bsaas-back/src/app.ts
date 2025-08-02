// Express server setup with CORS and HTTPS
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import i18nextMiddleware from 'i18next-http-middleware';
import i18n from './i18n';
import portfolioRoutes from './routes/portfolio.routes';
import themeRoutes from './routes/theme.routes';
import socialRoutes from './routes/social.routes';
import userRoutes from './routes/user.routes';
import docsRoutes from './routes/docs.routes';
import reviewRoutes from './routes/review.routes';
import salonRoutes from './routes/salon.routes';
import appointmentRoutes from './routes/appointment.routes';
import dashboardRoutes from './routes/dashboard.routes';
import salonStaffRequestRoutes from './routes/salon-staff-request.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import cookieParser from 'cookie-parser';

const app = express();

// CORS: Only allow trusted origins
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Secure cookies in production (fix type errors)
import { Response, CookieOptions } from 'express';
app.use((req, res, next) => {
  const origCookie = res.cookie.bind(res);
  res.cookie = function (name: string, value: any, options?: CookieOptions): Response {
    if (process.env.NODE_ENV === 'production') {
      options = options || {};
      options.secure = true;
      options.sameSite = 'strict';
    }
    // Always pass a CookieOptions object (never undefined)
    return origCookie(name, value, options || {});
  };
  next();
});

app.use(i18nextMiddleware.handle(i18n) as unknown as express.RequestHandler);

// API routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/user', userRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api', reviewRoutes);
app.use('/api', salonRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/staff-requests', salonStaffRequestRoutes);

// 404 handler
app.use(notFound);
// Central error handler
app.use(errorHandler);

export default app;
