import { ValidationError } from "@chao-game-online/shared/core";
import { userIdSchema } from "@chao-game-online/shared/auth";

export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    const result = userIdSchema.safeParse(value);
    if (!result.success) {
      const errorMessage = result.error.message || "無効なユーザーIDです";
      throw new ValidationError(errorMessage, "userId");
    }
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: UserId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
