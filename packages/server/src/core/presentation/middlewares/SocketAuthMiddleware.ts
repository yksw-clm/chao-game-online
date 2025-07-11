import type { ExtendedError, Socket } from "socket.io";
import { JwtTokenService } from "@auth/infrastructure/services/JwtTokenService";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketAuthMiddleware {
  constructor(private readonly tokenService: JwtTokenService) {}

  public authenticate = (socket: AuthenticatedSocket, next: (err?: ExtendedError) => void): void => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        next(new Error("認証トークンが必要です"));
        return;
      }

      const payload = this.tokenService.verifyToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("無効な認証トークンです"));
    }
  };
}
