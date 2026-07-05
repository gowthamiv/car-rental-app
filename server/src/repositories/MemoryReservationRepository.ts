import { Reservation } from '../domain/Reservation';
import { VehicleCategory } from '../domain/VehicleCategory';
import { IReservationRepository } from './IReservationRepository';

export class MemoryReservationRepository implements IReservationRepository {
  private readonly store = new Map<string, Reservation>();

  save(reservation: Reservation): Reservation {
    this.store.set(reservation.id, reservation);
    return reservation;
  }

  findById(id: string): Reservation | undefined {
    return this.store.get(id);
  }

  /** Returns all reservations for a user, active and cancelled — used by "My Reservations" */
  findByUserId(userId: string): Reservation[] {
    return [...this.store.values()].filter((r) => r.userId === userId);
  }

  /** Returns only active reservations of a category that overlap the given date range — used by AvailabilityService */
  findOverlapping(category: VehicleCategory, startDate: string, endDate: string): Reservation[] {
    return [...this.store.values()].filter(
      (r) => r.category === category && r.overlaps(startDate, endDate),
    );
  }

  /** Test-only helper — clears all data between test cases */
  clear(): void {
    this.store.clear();
  }
}