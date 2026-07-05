import { Request, Response } from 'express';
import { OtpService } from '../services/auth/OtpService';
import { JwtService } from '../services/auth/JwtService';
import { UserService } from '../services/auth/UserService';
import { ILogger } from '../logging/ILogger';
import { config } from '../config/config';

export function makeAuthController(
  otpService: OtpService,
  jwtService: JwtService,
  userService: UserService,
  logger: ILogger,
) {
  return {
    requestOtp(req: Request, res: Response) {
      const { mobileNumber } = req.body;
      const otp = otpService.generate(mobileNumber);
      logger.info(`OTP generated for ${mobileNumber}`);
      res.json({ message: 'OTP sent', ...(config.isDev && { otp }) });
    },

    verifyOtp(req: Request, res: Response) {
      const { mobileNumber, otp } = req.body;
      otpService.verify(mobileNumber, otp);
      const user = userService.findOrCreateByMobile(mobileNumber);
      const token = jwtService.sign({ userId: user.id, mobileNumber: user.mobileNumber });
      res.json({ token, userId: user.id });
    },
  };
}