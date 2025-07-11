import jwt from "jsonwebtoken";
import { AppError } from "@chao-game-online/shared/core";

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export class JwtTokenService {
  private readonly secret: jwt.Secret;
  private readonly expiresInHours: number;

  constructor(secret?: string, expiresInHours: number = 24) {
    this.secret = secret || process.env.JWT_SECRET || "default-secret-change-this";
    this.expiresInHours = expiresInHours;
  }

  public generateToken(userId: string): string {
    try {
      return jwt.sign({ userId }, this.secret, { expiresIn: `${this.expiresInHours}h` });
    } catch (error) {
      throw new AppError("TOKEN_GENERATION_ERROR", "トークンの生成に失敗しました", error);
    }
  }

  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("TOKEN_EXPIRED", "トークンの有効期限が切れています", error);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("INVALID_TOKEN", "無効なトークンです", error);
      }
      throw new AppError("TOKEN_VERIFICATION_ERROR", "トークンの検証に失敗しました", error);
    }
  }

  public refreshToken(token: string): string {
    const payload = this.verifyToken(token);
    return this.generateToken(payload.userId);
  }
}
