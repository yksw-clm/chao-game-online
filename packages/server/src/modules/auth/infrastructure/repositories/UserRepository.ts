import { User } from "@auth/domain/entities/User";
import type { IUserRepository } from "@auth/domain/repositories/IUserRepository";
import { DisplayName } from "@auth/domain/valueObjects/DisplayName";
import { HashedPassword } from "@auth/domain/valueObjects/HashedPassword";
import { UserId } from "@auth/domain/valueObjects/UserId";
import { AppError } from "@chao-game-online/shared/core";
import { PrismaClient } from "@core/infrastructure/database/PrismaClient";

export class UserRepository implements IUserRepository {
  private readonly prisma = PrismaClient.getInstance();

  public async findByUserId(userId: UserId): Promise<User | null> {
    try {
      const userRecord = await this.prisma.user.findUnique({
        where: { userId: userId.value },
      });

      if (!userRecord) {
        return null;
      }

      return User.reconstruct(
        new UserId(userRecord.userId),
        new DisplayName(userRecord.displayName),
        new HashedPassword(userRecord.hashedPassword),
        userRecord.createdAt,
        userRecord.updatedAt
      );
    } catch (error) {
      throw new AppError("DATABASE_ERROR", "ユーザーの検索に失敗しました", error);
    }
  }

  public async save(user: User): Promise<void> {
    try {
      await this.prisma.user.upsert({
        where: { userId: user.id.value },
        update: {
          displayName: user.displayName.value,
          updatedAt: user.updatedAt,
        },
        create: {
          userId: user.id.value,
          displayName: user.displayName.value,
          hashedPassword: user.hashedPassword.value,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      throw new AppError("DATABASE_ERROR", "ユーザーの保存に失敗しました", error);
    }
  }

  public async existsByUserId(userId: UserId): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { userId: userId.value },
      });
      return count > 0;
    } catch (error) {
      throw new AppError("DATABASE_ERROR", "ユーザーの存在確認に失敗しました", error);
    }
  }

  public async delete(userId: UserId): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { userId: userId.value },
      });
    } catch (error) {
      throw new AppError("DATABASE_ERROR", "ユーザーの削除に失敗しました", error);
    }
  }
}
