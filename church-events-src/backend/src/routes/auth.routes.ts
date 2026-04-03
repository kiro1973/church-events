import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { RegisterSchema, LoginSchema, CreateStaffSchema } from '../schemas';
import { ForgotPasswordSchema, ResetPasswordSchema } from '../schemas';

const router = Router();

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);
router.post('/staff',
  authenticate,
  requireRole('ADMIN'),
  validate(CreateStaffSchema),
  authController.createStaff
);
// Protected — only logged in user can get their own info
router.get('/me', authenticate, authController.getMe);

// Admin only — get all staff users
router.get(
  '/staff',
  authenticate,
  requireRole('ADMIN'),
  authController.getStaffUsers
);

router.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(ResetPasswordSchema), authController.resetPassword);


export default router;