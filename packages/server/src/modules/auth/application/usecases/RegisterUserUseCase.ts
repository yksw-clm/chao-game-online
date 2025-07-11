import type { IUserRepository } from "@auth/domain/repositories/IUserRepository";
import type { IPasswordService } from "../services/IPasswordService";
import { UserId } from "@auth/domain/valueObjects/UserId";
import { DisplayName } from "@auth/domain/valueObjects/DisplayName";
import { Password } from "@auth/domain/valueObjects/Password";
import { AppError } from "@chao-game-online/shared/core";
import { User } from "@auth/domain/entities/User";
import type { RegisterUserDto, UserDto } from "@chao-game-online/shared/auth";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService
  ) {}

  public async execute(dto: RegisterUserDto): Promise<UserDto> {
    try {
      // ValueObjectの作成（バリデーション含む）
      const userId = new UserId(dto.userId);
      const displayName = new DisplayName(dto.displayName);
      const password = new Password(dto.password);

      // ユーザーIDの重複確認
      const existingUser = await this.userRepository.findByUserId(userId);
      if (existingUser) {
        throw new AppError("USER_ALREADY_EXISTS", "指定されたユーザーIDは既に使用されています");
      }

      // パスワードのハッシュ化
      const hashedPassword = await this.passwordService.hash(password);

      // ユーザーエンティティの作成
      const user = User.create(userId, displayName, hashedPassword);

      // ユーザーの保存
      await this.userRepository.save(user);

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
      throw new AppError("REGISTER_USER_FAILED", "ユーザー登録に失敗しました", error);
    }
  }
}
