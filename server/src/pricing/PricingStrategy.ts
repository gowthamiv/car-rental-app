
export interface PricingStrategy {
  /**
   * Calculates the total price for a booking.
   * @param days - total duration of the booking in days
   * @param dailyMileage - only used by SUV pricing; ignored by other categories
   */
  calculatePrice(days: number, dailyMileage?: number): number;
}