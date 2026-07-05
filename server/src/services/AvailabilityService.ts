import { VehicleCategory } from '../domain/VehicleCategory';
import { IReservationRepository } from '../repositories/IReservationRepository';
import { IInventoryRepository } from '../repositories/IInventoryRepository';
import { AvailabilityError } from '../errors/AvailabilityError';

export class AvailabilityService {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  /**
   * Returns how many cars of a category are free for a given date range.
   * excludeReservationId lets a reservation being modified exclude itself
   * from the overlap count (otherwise it would always count against its own slot).
   */
  getAvailableCount(
    category: VehicleCategory,
    startDate: string,
    endDate: string,
    excludeReservationId?: string,
  ): number {
    const totalCount = this.inventoryRepo.getTotalCount(category);
    const overlapping = this.reservationRepo
      .findOverlapping(category, startDate, endDate)
      .filter((r) => r.id !== excludeReservationId);

    return Math.max(totalCount - overlapping.length, 0);
  }

  /** Throws AvailabilityError if no car of this category is free for the date range */
  assertAvailable(
    category: VehicleCategory,
    startDate: string,
    endDate: string,
    excludeReservationId?: string,
  ): void {
    const available = this.getAvailableCount(category, startDate, endDate, excludeReservationId);
    if (available <= 0) {
      throw new AvailabilityError(
        `No ${category} available for the selected dates (${startDate} to ${endDate}).`,
      );
    }
  }
}