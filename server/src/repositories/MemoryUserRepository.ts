import { User } from '../domain/User';
import { IUserRepository } from './IUserRepository';

export class MemoryUserRepository implements IUserRepository {
  private readonly store = new Map<string, User>();

  save(user: User): User {
    this.store.set(user.id, user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.store.get(id);
  }

  findByMobileNumber(mobileNumber: string): User | undefined {
    return [...this.store.values()].find((u) => u.mobileNumber === mobileNumber);
  }
}