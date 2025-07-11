import type { HashedPassword } from "@auth/domain/valueObjects/HashedPassword";
import type { Password } from "@auth/domain/valueObjects/Password";

export interface IPasswordService {
  hash(password: Password): Promise<HashedPassword>;
  verify(password: Password, hashedPassword: HashedPassword): Promise<boolean>;
}
