import { UserId } from "../valueObjects/UserId";
import { DisplayName } from "../valueObjects/DisplayName";
import { HashedPassword } from "../valueObjects/HashedPassword";

export class User {
  constructor(
    private readonly _id: UserId,
    private _displayName: DisplayName,
    private readonly _hashedPassword: HashedPassword,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  public get id(): UserId {
    return this._id;
  }

  public get displayName(): DisplayName {
    return this._displayName;
  }

  public get hashedPassword(): HashedPassword {
    return this._hashedPassword;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateDisplayName(displayName: DisplayName): void {
    this._displayName = displayName;
    this._updatedAt = new Date();
  }

  public equals(other: User): boolean {
    return this._id.equals(other._id);
  }

  public static create(id: UserId, displayName: DisplayName, hashedPassword: HashedPassword): User {
    return new User(id, displayName, hashedPassword);
  }

  public static reconstruct(
    id: UserId,
    displayName: DisplayName,
    hashedPassword: HashedPassword,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, displayName, hashedPassword, createdAt, updatedAt);
  }
}
