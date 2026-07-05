// controllers/reservationController.ts
import { Request, Response } from 'express';
import { ReservationService } from '../services/ReservationService';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { getRequiredParam } from '../utils/requestUtil';

export function makeReservationController(reservationService: ReservationService) {
  return {
    getOptions(req: Request, res: Response) {
      const { startDate, endDate, dailyMileage } = req.body;
      res.json(reservationService.getOptions({ startDate, endDate, dailyMileage }));
    },

    reserveCar(req: AuthenticatedRequest, res: Response) {
      const userId = req.user!.userId;
      const { category, startDate, endDate, dailyMileage } = req.body;
      const reservation = reservationService.reserveCar({ userId, category, startDate, endDate, dailyMileage });
      res.status(201).json(reservation);
    },

    getMyReservations(req: AuthenticatedRequest, res: Response) {
      res.json(reservationService.getMyReservations(req.user!.userId));
    },

    getReservationById(req: AuthenticatedRequest, res: Response) {
      const id = getRequiredParam(req, 'id');
      res.json(reservationService.getReservationById(req.user!.userId, id));
    },

    modifyReservation(req: Request, res: Response) {
      const id = getRequiredParam(req, 'id');
      const { category, startDate, endDate, dailyMileage } = req.body;
      res.json(reservationService.modifyReservation(id, { category, startDate, endDate, dailyMileage }));
    },

    cancelReservation(req: Request, res: Response) {
      const id = getRequiredParam(req, 'id');
      reservationService.cancelReservation(id);
      res.status(204).send();
    },
  };
}