import type { Response } from "express";

export class CookieUtils {
  private static readonly ACCESS_TOKEN_COOKIE = "access_token";
  private static readonly REFRESH_TOKEN_COOKIE = "refresh_token";

  public static setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      path: "/",
    };

    // アクセストークン (1時間)
    res.cookie(this.ACCESS_TOKEN_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1時間
    });

    // リフレッシュトークン (30日)
    res.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30日
    });
  }

  public static clearTokenCookies(res: Response): void {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      path: "/",
    };

    res.clearCookie(this.ACCESS_TOKEN_COOKIE, cookieOptions);
    res.clearCookie(this.REFRESH_TOKEN_COOKIE, cookieOptions);
  }

  public static getAccessToken(cookies: Record<string, string>): string | undefined {
    return cookies[this.ACCESS_TOKEN_COOKIE];
  }

  public static getRefreshToken(cookies: Record<string, string>): string | undefined {
    return cookies[this.REFRESH_TOKEN_COOKIE];
  }
}
