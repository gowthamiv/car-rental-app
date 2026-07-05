import { User } from '../domain/User';

export interface IUserRepository {
  save(user: User): User;
  findById(id: string): User | undefined;
  findByMobileNumber(mobileNumber: string): User | undefined;
}