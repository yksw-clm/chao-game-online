import type { IUserRepository } from "@auth/domain/repositories/IUserRepository";
import { UserId } from "@auth/domain/valueObjects/UserId";
import type { UserDto } from "@chao-game-online/shared/auth";
import { AppError } from "@chao-game-online/shared/core";

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<UserDto> {
    try {
      // ValueObjectの作成（バリデーション含む）
      const userIdVO = new UserId(userId);

      // ユーザーの検索
      const user = await this.userRepository.findByUserId(userIdVO);
      if (!user) {
        throw new AppError("USER_NOT_FOUND", "ユーザーが見つかりません");
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
      throw new AppError("GET_USER_FAILED", "ユーザー情報の取得に失敗しました", error);
    }
  }
}
