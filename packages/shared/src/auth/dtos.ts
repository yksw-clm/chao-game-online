export type RegisterUserDto = {
  userId: string;
  displayName: string;
  password: string;
};

export type LoginUserDto = {
  userId: string;
  password: string;
};

export type UpdateDisplayNameDto = {
  userId: string;
  displayName: string;
};

export type UserDto = {
  userId: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
};
