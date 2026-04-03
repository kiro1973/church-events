import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { singleUpload } from '../middleware/upload.middleware';
import { UpdateSettingsSchema } from '../schemas';
const router = Router();

// Public — frontend needs church name, payment info
router.get('/', settingsController.getSettings);

// Protected — Responsible + Admin only
router.put('/',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  validate(UpdateSettingsSchema),
  settingsController.updateSettings
);

// Protected — upload hero image
router.post('/hero-image',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  singleUpload,
  settingsController.uploadHeroImage
);

export default router;