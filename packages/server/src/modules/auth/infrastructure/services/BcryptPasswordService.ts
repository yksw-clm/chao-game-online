import type { IPasswordService } from "@auth/application/services/IPasswordService";
import { Password } from "@auth/domain/valueObjects/Password";
import { HashedPassword } from "@auth/domain/valueObjects/HashedPassword";
import bcrypt from "bcrypt";
import { AppError } from "@chao-game-online/shared/core";

export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds = 12;

  public async hash(password: Password): Promise<HashedPassword> {
    try {
      const hashedValue = await bcrypt.hash(password.value, this.saltRounds);
      return new HashedPassword(hashedValue);
    } catch (error) {
      throw new AppError("PASSWORD_HASH_ERROR", "パスワードのハッシュ化に失敗しました", error);
    }
  }

  public async verify(password: Password, hashedPassword: HashedPassword): Promise<boolean> {
    try {
      return await bcrypt.compare(password.value, hashedPassword.value);
    } catch (error) {
      throw new AppError("PASSWORD_VERIFY_ERROR", "パスワードの検証に失敗しました", error);
    }
  }
}
