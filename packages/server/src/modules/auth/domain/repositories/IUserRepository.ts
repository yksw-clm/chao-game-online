import { User } from "../entities/User";
import { UserId } from "../valueObjects/UserId";

export interface IUserRepository {
  findByUserId(userId: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  existsByUserId(userId: UserId): Promise<boolean>;
  delete(id: UserId): Promise<void>;
}
