import type { IUserRepository } from "@auth/domain/repositories/IUserRepository";
import { DisplayName } from "@auth/domain/valueObjects/DisplayName";
import { UserId } from "@auth/domain/valueObjects/UserId";
import type { UpdateDisplayNameDto, UserDto } from "@chao-game-online/shared/auth";
import { AppError } from "@chao-game-online/shared/core";

export class UpdateDisplayNameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: UpdateDisplayNameDto): Promise<UserDto> {
    try {
      // ValueObjectの作成（バリデーション含む）
      const userId = new UserId(dto.userId);
      const displayName = new DisplayName(dto.displayName);

      // ユーザーの検索
      const user = await this.userRepository.findByUserId(userId);
      if (!user) {
        throw new AppError("USER_NOT_FOUND", "ユーザーが見つかりません");
      }

      // 表示名の更新
      user.updateDisplayName(displayName);

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
      throw new AppError("UPDATE_DISPLAY_NAME_FAILED", "表示名の更新に失敗しました", error);
    }
  }
}
