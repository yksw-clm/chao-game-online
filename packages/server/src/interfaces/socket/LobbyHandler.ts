import { lobbyService } from "@application/services/LobbyService";
import type { AuthenticatedSocket, MyServer } from "./types";
import {
	CreateRoomSchema,
	JoinRoomSchema,
	type CreateRoomPayload,
	type JoinRoomPayload,
} from "@chao-game-online/shared/schemas/lobby.schema";
import type { AckResponse } from "@chao-game-online/shared/events";
import type { RoomStateDto } from "@chao-game-online/shared/dtos";

/**
 * Socket.IOのロビー関連イベントを処理するハンドラクラス。
 * 認証済みソケット接続ごとにインスタンス化される。
 */
export class LobbyHandler {
	/**
	 * @param io Socket.IOサーバーインスタンス
	 * @param socket 認証済みのクライアントソケットインスタンス
	 */
	constructor(
		private readonly io: MyServer,
		private readonly socket: AuthenticatedSocket
	) {}

	/**
	 * このソケットが待ち受ける全てのイベントリスナーを登録します。
	 */
	public registerListeners(): void {
		this.socket.on("lobby:create", this.handleCreateRoom.bind(this));
		this.socket.on("lobby:join", this.handleJoinRoom.bind(this));
		this.socket.on("room:leave", this.handleLeaveRoom.bind(this));
		this.socket.on("disconnect", this.handleDisconnect.bind(this));
	}

	/**
	 * ロビーにいる全クライアントに、最新のルーム一覧情報をブロードキャストします。
	 */
	private emitLobbyUpdate(): void {
		this.io.emit("lobby:rooms_updated", lobbyService.getAllRoomsInfoDtos());
	}

	/**
	 * 'lobby:create' イベントを処理します。
	 * ルームを作成し、作成者を参加させ、成功/失敗をクライアントに通知します。
	 * @param payload クライアントから送信されたルーム作成情報
	 * @param ack クライアントへの応答用コールバック関数
	 */
	private handleCreateRoom(payload: CreateRoomPayload, ack: (res: AckResponse<RoomStateDto>) => void) {
		const user = this.socket.data.user;
		const result = CreateRoomSchema.safeParse(payload);

		if (!result.success) {
			return ack({ success: false, error: result.error.message });
		}
		try {
			const room = lobbyService.createRoom(user, result.data.name, result.data.GameType);
			this.socket.join(String(room.number));
			ack({ success: true, data: room.toRoomStateDto() });

			// ルーム作成後に全クライアントに更新を通知
			this.emitLobbyUpdate();
		} catch (err) {
			ack({ success: false, error: err instanceof Error ? err.message : "不明なエラー" });
		}
	}

	/**
	 * 'lobby:join' イベントを処理します。
	 * 既存のルームに参加し、成功/失敗をクライアントに通知します。
	 * @param payload クライアントから送信された参加ルーム情報
	 * @param ack クライアントへの応答用コールバック関数
	 */
	private handleJoinRoom(payload: JoinRoomPayload, ack: (res: AckResponse<RoomStateDto>) => void): void {
		const user = this.socket.data.user;
		const result = JoinRoomSchema.safeParse(payload);

		if (!result.success) {
			return ack({ success: false, error: result.error.message });
		}
		try {
			const room = lobbyService.joinRoom(user, result.data.roomNumber);
			this.socket.join(String(room.number));
			ack({ success: true, data: room.toRoomStateDto() });

			// ルーム内の全員に更新を通知
			this.io.to(String(room.number)).emit("room:updated", room.toRoomStateDto());
			// ロビーにいる全員に更新を通知
			this.emitLobbyUpdate();
		} catch (e) {
			ack({ success: false, error: e instanceof Error ? e.message : "不明なエラー" });
		}
	}

	/**
	 * 'room:leave' イベントを処理します。
	 * 現在のルームから退出します。
	 * @param ack クライアントへの応答用コールバック関数
	 */
	private handleLeaveRoom(ack: (res: AckResponse) => void) {
		const user = this.socket.data.user;
		const updatedRoom = lobbyService.leaveRoom(user.uid);

		if (updatedRoom) {
			const roomNumberStr = String(updatedRoom.number);
			this.socket.leave(roomNumberStr);
			// ルーム内の残りのメンバーに更新を通知
			this.io.to(roomNumberStr).emit("room:updated", updatedRoom.toRoomStateDto());
		}

		ack({ success: true, data: null });
		// ロビーにいる全員に更新を通知
		this.emitLobbyUpdate();
	}

	/**
	 * 'disconnect' イベントを処理します。
	 * ユーザーがブラウザを閉じるなどして切断した場合に、ルームから自動的に退出させます。
	 */
	private handleDisconnect() {
		const user = this.socket.data.user;
		console.log(`ユーザーが切断しました: ${user.uid} (${user.displayName})`);
		const updatedRoom = lobbyService.leaveRoom(user.uid);
		if (updatedRoom) {
			this.io.to(String(updatedRoom.number)).emit("room:updated", updatedRoom.toRoomStateDto());
		}
		// ロビーにいる全員に更新を通知
		this.emitLobbyUpdate();
	}
}
