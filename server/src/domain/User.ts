export class User {
  constructor(
    public readonly id: string,
    public readonly mobileNumber: string,
    public readonly createdAt: string = new Date().toISOString(),
  ) {}

  /** Used in API responses / logs — never expose the raw number in places like logs or error messages */
  maskedMobileNumber(): string {
    return this.mobileNumber.replace(/(\d{2})\d+(\d{2})$/, '$1****$2');
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}