import type { ExtendedError, Socket } from "socket.io";
import { JwtTokenService } from "@auth/infrastructure/services/JwtTokenService";
import { CookieUtils } from "@core/utils/CookieUtils";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketAuthMiddleware {
  constructor(private readonly tokenService: JwtTokenService) {}

  public authenticate = (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void): void => {
    try {
      // Cookieからトークンを取得
      const cookies = this.parseCookies(socket.handshake.headers.cookie || "");
      const accessToken = CookieUtils.getAccessToken(cookies);

      if (!accessToken) {
        next(new Error("認証トークンが必要です"));
        return;
      }

      try {
        const payload = this.tokenService.verifyAccessToken(accessToken);
        socket.userId = payload.userId;
        next();
      } catch {
        // アクセストークンが期限切れの場合、リフレッシュトークンで確認
        const refreshToken = CookieUtils.getRefreshToken(cookies);

        if (!refreshToken) {
          next(new Error("認証が必要です"));
          return;
        }

        try {
          const refreshPayload = this.tokenService.verifyRefreshToken(refreshToken);
          socket.userId = refreshPayload.userId;
          next();
        } catch {
          next(new Error("無効な認証トークンです"));
        }
      }
    } catch {
      next(new Error("認証処理でエラーが発生しました"));
    }
  };

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      if (name && rest.length > 0) {
        cookies[name.trim()] = rest.join("=").trim();
      }
    });

    return cookies;
  }
}
