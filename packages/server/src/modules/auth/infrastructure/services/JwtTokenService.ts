import jwt from "jsonwebtoken";
import { AppError } from "@chao-game-online/shared/core";

export interface TokenPayload {
  userId: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtTokenService {
  private readonly secret: string;
  private readonly accessTokenExpiresIn = "1h";
  private readonly refreshTokenExpiresIn = "30d";

  constructor(secret?: string) {
    this.secret = secret || process.env.JWT_SECRET || "default-secret-change-this";
  }

  public generateTokenPair(userId: string): TokenPair {
    try {
      const accessToken = jwt.sign({ userId, type: "access" }, this.secret, { expiresIn: this.accessTokenExpiresIn });

      const refreshToken = jwt.sign({ userId, type: "refresh" }, this.secret, {
        expiresIn: this.refreshTokenExpiresIn,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new AppError("TOKEN_GENERATION_ERROR", "トークンの生成に失敗しました", error);
    }
  }

  public verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.secret) as TokenPayload;
      if (payload.type !== "access") {
        throw new AppError("INVALID_TOKEN_TYPE", "アクセストークンではありません");
      }
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("ACCESS_TOKEN_EXPIRED", "アクセストークンの有効期限が切れています", error);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("INVALID_ACCESS_TOKEN", "無効なアクセストークンです", error);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("ACCESS_TOKEN_VERIFICATION_ERROR", "アクセストークンの検証に失敗しました", error);
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.secret) as TokenPayload;
      if (payload.type !== "refresh") {
        throw new AppError("INVALID_TOKEN_TYPE", "リフレッシュトークンではありません");
      }
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("REFRESH_TOKEN_EXPIRED", "リフレッシュトークンの有効期限が切れています", error);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("INVALID_REFRESH_TOKEN", "無効なリフレッシュトークンです", error);
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("REFRESH_TOKEN_VERIFICATION_ERROR", "リフレッシュトークンの検証に失敗しました", error);
    }
  }

  public refreshTokenPair(refreshToken: string): TokenPair {
    const payload = this.verifyRefreshToken(refreshToken);
    return this.generateTokenPair(payload.userId);
  }
}
