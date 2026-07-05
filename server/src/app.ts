
import express from 'express';
import cors from 'cors';

import { config } from './config/config';

// Logging
import { ConsoleLogger } from './logging/ConsoleLogger';

// Repositories
import { MemoryReservationRepository } from './repositories/MemoryReservationRepository';
import { MemoryInventoryRepository } from './repositories/MemoryInventoryRepository';
import { MemoryUserRepository } from './repositories/MemoryUserRepository';

// Pricing
import { PricingFactory } from './pricing/PricingFactory';
import { PricingService } from './pricing/PricingService';

// Services
import { AvailabilityService } from './services/AvailabilityService';
import { ReservationService } from './services/ReservationService';
import { OtpService } from './services/auth/OtpService';
import { JwtService } from './services/auth/JwtService';
import { UserService } from './services/auth/UserService';

// Controllers
import { makeAuthController } from './controllers/authController';
import { makeReservationController } from './controllers/reservationController';

// Routes
import { makeAuthRoutes } from './routes/authRoutes';
import { makeReservationRoutes } from './routes/reservationRoutes';

// Middleware
import { makeAuthMiddleware } from './middleware/authMiddleware';
import { makeErrorHandler } from './middleware/errorHandler';

import { validate } from './middleware/validate';
import { optionsSchema } from './validation/reservationSchemas';

// ─────────────────────────────────────────────────────────────
// 1. Composition root — every dependency instantiated exactly
//    once and injected via constructors. No Singletons.
// ─────────────────────────────────────────────────────────────

const logger = new ConsoleLogger();

// Repositories
const reservationRepo = new MemoryReservationRepository();
const inventoryRepo = new MemoryInventoryRepository(); // seeded with default counts
const userRepo = new MemoryUserRepository();

// Pricing
const pricingFactory = new PricingFactory();
const pricingService = new PricingService(pricingFactory);

// Domain services
const availabilityService = new AvailabilityService(reservationRepo, inventoryRepo);
const reservationService = new ReservationService(
  reservationRepo,
  inventoryRepo,
  availabilityService,
  pricingService,
  logger,
);

// Auth services
const otpService = new OtpService();
const jwtService = new JwtService();
const userService = new UserService(userRepo);

// Middleware that depend on services
const authMiddleware = makeAuthMiddleware(jwtService);
const errorHandler = makeErrorHandler(logger);

// Controllers
const authController = makeAuthController(otpService, jwtService, userService, logger);
const reservationController = makeReservationController(reservationService);

// ─────────────────────────────────────────────────────────────
// 2. Express app setup
// ─────────────────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', makeAuthRoutes(authController));
app.post('/api/options', validate(optionsSchema), reservationController.getOptions);
app.use('/api/reservations', authMiddleware, makeReservationRoutes(reservationController));

// Global error handler — must be registered last, after all routes
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// 3. Start server
// ─────────────────────────────────────────────────────────────

app.listen(config.port, () => {
  logger.info(`Server running on http://localhost:${config.port}`);
});

export default app;