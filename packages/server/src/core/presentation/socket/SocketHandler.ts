import type { Server } from "socket.io";
import type { AuthenticatedSocket } from "@core/presentation/middlewares/SocketAuthMiddleware";
import { SocketAuthMiddleware } from "@core/presentation/middlewares/SocketAuthMiddleware";

export class SocketHandler {
  constructor(
    private readonly io: Server,
    private readonly socketAuthMiddleware: SocketAuthMiddleware
  ) {
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(this.socketAuthMiddleware.authenticate);
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);

      socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
      });

      // 今後のゲーム関連イベントはここに追加
    });
  }
}
