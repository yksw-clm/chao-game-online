import type { IUserRepository } from "@auth/domain/repositories/IUserRepository";
import { UserId } from "@auth/domain/valueObjects/UserId";
import { AppError } from "@chao-game-online/shared/core";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<void> {
    try {
      // ValueObjectの作成（バリデーション含む）
      const userIdVO = new UserId(userId);

      // ユーザーの存在確認
      const existingUser = await this.userRepository.findByUserId(userIdVO);
      if (!existingUser) {
        throw new AppError("USER_NOT_FOUND", "ユーザーが見つかりません");
      }

      // ユーザーの削除
      await this.userRepository.delete(userIdVO);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("DELETE_USER_FAILED", "ユーザーの削除に失敗しました", error);
    }
  }
}
