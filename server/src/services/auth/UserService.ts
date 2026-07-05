import { randomUUID } from 'crypto';
import { User } from '../../domain/User';
import { IUserRepository } from '../../repositories/IUserRepository';

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  findOrCreateByMobile(mobileNumber: string): User {
    const existing = this.userRepo.findByMobileNumber(mobileNumber);
    if (existing) return existing;

    const user = new User(randomUUID(), mobileNumber);
    return this.userRepo.save(user);
  }
}