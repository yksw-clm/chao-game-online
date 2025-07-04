import { Server } from "socket.io";
import { authMiddleware } from "./authMiddleware";
import type { MyServer } from "./types";

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

			// TODO: ルーム管理などのイベントリスナーをここに実装
			// e.g. new RoomHandler(this.io, socket).registerListeners();

			socket.on("disconnect", () => {
				console.log(`ユーザーが切断しました: ${user.uid} (${user.displayName})`);
			});
		});

		this.io.listen(port);
		console.log(`サーバーを起動しました: ${port}`);
	}
}
