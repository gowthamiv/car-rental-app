import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requestOtpSchema, verifyOtpSchema } from '../validation/authSchemas';
import { makeAuthController } from '../controllers/authController';

export function makeAuthRoutes(authController: ReturnType<typeof makeAuthController>): Router {
  const router = Router();

  router.post('/request-otp', validate(requestOtpSchema), authController.requestOtp);
  router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

  return router;
}