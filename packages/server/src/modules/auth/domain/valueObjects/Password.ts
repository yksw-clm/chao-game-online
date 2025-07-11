import { passwordSchema } from "@chao-game-online/shared/auth";
import { ValidationError } from "@chao-game-online/shared/core";

export class Password {
  private readonly _value: string;

  constructor(value: string) {
    const result = passwordSchema.safeParse(value);
    if (!result.success) {
      throw new ValidationError(result.error.message, "password");
    }
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Password): boolean {
    return this._value === other._value;
  }
}
