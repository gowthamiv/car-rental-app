import { Router } from 'express';
import { validate } from '../middleware/validate';
import { reserveSchema, modifySchema } from '../validation/reservationSchemas';
import { makeReservationController } from '../controllers/reservationController';

export function makeReservationRoutes(
  reservationController: ReturnType<typeof makeReservationController>,
): Router {
  const router = Router();

  router.post('/', validate(reserveSchema), reservationController.reserveCar);
  router.get('/', reservationController.getMyReservations);
  router.get('/:id', reservationController.getReservationById);
  router.put('/:id', validate(modifySchema), reservationController.modifyReservation);
  router.delete('/:id', reservationController.cancelReservation);

  return router;
}