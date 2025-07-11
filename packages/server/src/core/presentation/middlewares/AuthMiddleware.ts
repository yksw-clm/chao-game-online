import type { Request, Response, NextFunction } from "express";
import { JwtTokenService } from "@auth/infrastructure/services/JwtTokenService";
import { Result } from "@chao-game-online/shared/core";
import { AppError } from "@chao-game-online/shared/core";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AuthMiddleware {
  constructor(private readonly tokenService: JwtTokenService) {}

  public authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json(Result.fail(new AppError("UNAUTHORIZED", "認証が必要です")));
        return;
      }

      const token = authHeader.substring(7);
      const payload = this.tokenService.verifyToken(token);
      req.userId = payload.userId;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(401).json(Result.fail(error));
        return;
      }
      res.status(500).json(Result.fail(new AppError("INTERNAL_SERVER_ERROR", "認証処理でエラーが発生しました")));
    }
  };
}
