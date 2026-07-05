import { VehicleCategory } from "./VehicleCategory";

export class Reservation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public category: VehicleCategory,
    public startDate: string,
    public endDate: string,
    public dailyMileage: number | undefined,
    public totalPrice: number,
    public status: 'ACTIVE' | 'CANCELLED' = 'ACTIVE',
  ) {}

  cancel(): void { this.status = 'CANCELLED'; }
  isActive(): boolean { return this.status === 'ACTIVE'; }

  overlaps(startDate: string, endDate: string): boolean {
    return this.isActive() && this.startDate < endDate && startDate < this.endDate;
  }

  get durationDays(): number {
    return Math.ceil((new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / 86_400_000);
  }
}