import { Server } from "socket.io";
import { authMiddleware } from "./authMiddleware";
import type { MyServer } from "./types";
import { LobbyHandler } from "./LobbyHandler";
import { lobbyService } from "@application/services/LobbyService";

// サーバーのセットアップと起動ロジック
export class SocketServer {
	private io: MyServer;

	constructor(origin: string) {
		this.io = new Server({
			cors: {
				origin,
				methods: ["GET", "POST"],
			},
		}) as MyServer;
	}

	public listen(port: number): void {
		// ミドルウェアを登録
		this.io.use(authMiddleware);

		this.io.on("connection", (socket) => {
			const user = socket.data.user; // 認証済みのユーザー情報
			console.log(`ユーザーが接続しました: ${user.uid} (${user.displayName})`);

			// LobbyHandlerをインスタンス化してリスナーを登録
			new LobbyHandler(this.io, socket).registerListeners();

			// 接続時に現在のロビー情報を送る
			socket.emit("lobby:rooms_updated", lobbyService.getAllRoomsInfoDtos());
		});

		this.io.listen(port);
		console.log(`サーバーを起動しました: ${port}`);
	}
}
