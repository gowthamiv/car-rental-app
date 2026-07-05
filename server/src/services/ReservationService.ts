import { randomUUID } from 'crypto';
import { Reservation } from '../domain/Reservation';
import { VehicleCategory } from '../domain/VehicleCategory';
import { IReservationRepository } from '../repositories/IReservationRepository';
import { IInventoryRepository } from '../repositories/IInventoryRepository';
import { AvailabilityService } from './AvailabilityService';
import { PricingService } from '../pricing/PricingService';
import { ILogger } from '../logging/ILogger';
import { ReservationNotFoundError } from '../errors/ReservationNotFoundError';
import { calculateDays } from '../utils/dateUtil';

export interface ReserveRequest {
  userId: string;
  category: VehicleCategory;
  startDate: string;
  endDate: string;
  dailyMileage?: number;
}

export interface ModifyRequest {
  category?: VehicleCategory;
  startDate?: string;
  endDate?: string;
  dailyMileage?: number;
}

export interface OptionsRequest {
  startDate: string;
  endDate: string;
  dailyMileage?: number;
}

export interface PricingOption {
  category: VehicleCategory;
  totalPrice: number;
  availableCount: number;
}

export class ReservationService {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly inventoryRepo: IInventoryRepository,
    private readonly availabilityService: AvailabilityService,
    private readonly pricingService: PricingService,
    private readonly logger: ILogger,
  ) {}

  reserveCar(request: ReserveRequest): Reservation {
    const days = calculateDays(request.startDate, request.endDate);

    this.availabilityService.assertAvailable(request.category, request.startDate, request.endDate);

    const totalPrice = this.pricingService.priceFor(request.category, days, request.dailyMileage);

    const reservation = new Reservation(
      randomUUID(),
      request.userId,
      request.category,
      request.startDate,
      request.endDate,
      request.dailyMileage,
      totalPrice,
    );

    this.reservationRepo.save(reservation);
    this.logger.info(`Reservation created: ${reservation.id} (${reservation.category})`);
    return reservation;
  }

  modifyReservation(id: string, request: ModifyRequest): Reservation {
    const reservation = this.getExistingActiveReservation(id);

    const category = request.category ?? reservation.category;
    const startDate = request.startDate ?? reservation.startDate;
    const endDate = request.endDate ?? reservation.endDate;
    const dailyMileage = request.dailyMileage ?? reservation.dailyMileage;

    // Exclude this reservation's own current slot from the availability check,
    // otherwise modifying dates on the same category would always "conflict with itself"
    this.availabilityService.assertAvailable(category, startDate, endDate, reservation.id);

    const days = calculateDays(startDate, endDate);
    const totalPrice = this.pricingService.priceFor(category, days, dailyMileage);

    reservation.category = category;
    reservation.startDate = startDate;
    reservation.endDate = endDate;
    reservation.dailyMileage = dailyMileage;
    reservation.totalPrice = totalPrice;

    this.reservationRepo.save(reservation);
    this.logger.info(`Reservation modified: ${reservation.id}`);
    return reservation;
  }

  cancelReservation(id: string): void {
    const reservation = this.getExistingActiveReservation(id);
    reservation.cancel();
    this.reservationRepo.save(reservation);
    this.logger.info(`Reservation cancelled: ${reservation.id}`);
  }

  getOptions(request: OptionsRequest): PricingOption[] {
    const days = calculateDays(request.startDate, request.endDate);

    const options = this.inventoryRepo.getAllCategories().map((category) => ({
      category,
      totalPrice: this.pricingService.priceFor(category, days, request.dailyMileage),
      availableCount: this.availabilityService.getAvailableCount(category, request.startDate, request.endDate),
    }));

    return options.sort((a, b) => a.totalPrice - b.totalPrice);
  }

  private getExistingActiveReservation(id: string): Reservation {
    const reservation = this.reservationRepo.findById(id);
    if (!reservation || !reservation.isActive()) {
      throw new ReservationNotFoundError(`No active reservation found with id ${id}.`);
    }
    return reservation;
  }

  getMyReservations(userId: string): Reservation[] {
    return this.reservationRepo.findByUserId(userId);
  }

  getReservationById(userId: string, id: string): Reservation {
    const reservation = this.reservationRepo.findById(id);
    if (!reservation || reservation.userId !== userId) {
      throw new ReservationNotFoundError(`No reservation found with id ${id}.`);
    }
    return reservation;
  }
}