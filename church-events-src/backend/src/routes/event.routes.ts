import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';
const router = Router();

// Public — anyone can browse events
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Protected — only Responsible or Admin can manage events
import { validate } from '../middleware/validate.middleware';
import { CreateEventSchema, UpdateEventSchema, UpdateEventPriceSchema } from '../schemas';

router.post('/',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  upload.single('image'),
  validate(CreateEventSchema),
  eventController.createEvent
);

router.put('/:id',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  upload.single('image'),
  validate(UpdateEventSchema),
  eventController.updateEvent
);

router.patch('/:id/price',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  validate(UpdateEventPriceSchema),
  eventController.updateEventPrice
);

router.delete(
  '/:id',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  eventController.deleteEvent
);

export default router;