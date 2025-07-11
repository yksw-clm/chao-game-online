export class HashedPassword {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Hashed password cannot be empty");
    }
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: HashedPassword): boolean {
    return this._value === other._value;
  }
}
