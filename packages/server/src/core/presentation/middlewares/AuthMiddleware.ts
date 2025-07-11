import type { Request, Response, NextFunction } from "express";
import { JwtTokenService } from "@auth/infrastructure/services/JwtTokenService";
import { CookieUtils } from "@core/utils/CookieUtils";
import { Result } from "@chao-game-online/shared/core";
import { AppError } from "@chao-game-online/shared/core";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AuthMiddleware {
  constructor(private readonly tokenService: JwtTokenService) {}

  public authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const accessToken = CookieUtils.getAccessToken(req.cookies);

      if (!accessToken) {
        res.status(401).json(Result.fail(new AppError("UNAUTHORIZED", "認証が必要です")));
        return;
      }

      try {
        const payload = this.tokenService.verifyAccessToken(accessToken);
        req.userId = payload.userId;
        next();
      } catch (error) {
        if (error instanceof AppError && error.code === "ACCESS_TOKEN_EXPIRED") {
          // アクセストークンが期限切れの場合、リフレッシュトークンで自動更新を試行
          this.tryRefreshToken(req, res, next);
          return;
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        res.status(401).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "認証処理でエラーが発生しました")));
    }
  };

  private tryRefreshToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const refreshToken = CookieUtils.getRefreshToken(req.cookies);

      if (!refreshToken) {
        res.status(401).json(Result.fail(new AppError("UNAUTHORIZED", "認証が必要です")));
        return;
      }

      // リフレッシュトークンでトークンペアを再生成
      const tokenPair = this.tokenService.refreshTokenPair(refreshToken);

      // 新しいトークンをCookieに設定
      CookieUtils.setTokenCookies(res, tokenPair.accessToken, tokenPair.refreshToken);

      // 新しいアクセストークンでユーザーIDを取得
      const payload = this.tokenService.verifyAccessToken(tokenPair.accessToken);
      req.userId = payload.userId;

      next();
    } catch (error) {
      // リフレッシュトークンも無効な場合は認証失敗
      CookieUtils.clearTokenCookies(res);

      if (error instanceof AppError) {
        res.status(401).json(Result.fail(error));
        return;
      }
      res
        .status(500)
        .json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "トークンリフレッシュでエラーが発生しました")));
    }
  };
}
