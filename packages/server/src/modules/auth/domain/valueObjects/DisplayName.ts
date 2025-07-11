import { displayNameSchema } from "@chao-game-online/shared/auth";
import { ValidationError } from "@chao-game-online/shared/core";

export class DisplayName {
  private readonly _value: string;

  constructor(value: string) {
    const result = displayNameSchema.safeParse(value);
    if (!result.success) {
      throw new ValidationError(result.error.message, "displayName");
    }
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: DisplayName): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
