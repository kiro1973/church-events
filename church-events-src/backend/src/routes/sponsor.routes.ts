import { Router } from 'express';
import * as sponsorController from '../controllers/sponsor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreateSponsorSchema } from '../schemas';
const router = Router();

// Public — anyone can see active sponsors
router.get('/', sponsorController.getAllSponsors);

// Protected — Responsible + Admin only
router.get(
  '/admin',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  sponsorController.getAllSponsorsAdmin
);

router.post('/',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  upload.single('logo'),
  validate(CreateSponsorSchema),
  sponsorController.createSponsor
);

router.put(
  '/:id',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  upload.single('logo'),
  sponsorController.updateSponsor
);

router.delete(
  '/:id',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  sponsorController.deleteSponsor
);

export default router;