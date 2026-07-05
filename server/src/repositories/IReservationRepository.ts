import { Reservation } from "../domain/Reservation";
import { VehicleCategory } from "../domain/VehicleCategory";

export interface IReservationRepository {
  save(reservation: Reservation): Reservation;
  findById(id: string): Reservation | undefined;
  findByUserId(userId: string): Reservation[];
  findOverlapping(category: VehicleCategory, startDate: string, endDate: string): Reservation[];
}