import type { IUserRepository } from "@auth/domain/repositories/IUserRepository";
import type { IPasswordService } from "../services/IPasswordService";
import { UserId } from "@auth/domain/valueObjects/UserId";
import { Password } from "@auth/domain/valueObjects/Password";
import { AppError } from "@chao-game-online/shared/core";
import type { LoginUserDto, UserDto } from "@chao-game-online/shared/auth";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService
  ) {}

  public async execute(dto: LoginUserDto): Promise<UserDto> {
    try {
      // ValueObjectの作成（バリデーション含む）
      const userId = new UserId(dto.userId);
      const password = new Password(dto.password);

      // ユーザーの検索
      const user = await this.userRepository.findByUserId(userId);
      if (!user) {
        throw new AppError("USER_NOT_FOUND", "ユーザーIDまたはパスワードが間違っています");
      }

      // パスワードの検証
      const isPasswordValid = await this.passwordService.verify(password, user.hashedPassword);
      if (!isPasswordValid) {
        throw new AppError("INVALID_PASSWORD", "ユーザーIDまたはパスワードが間違っています");
      }

      // DTOに変換して返却
      return {
        userId: user.id.value,
        displayName: user.displayName.value,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("LOGIN_FAILED", "ログインに失敗しました", error);
    }
  }
}
