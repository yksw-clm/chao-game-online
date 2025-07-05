import type { AuthenticatedSocket, MyServer } from "./types";
import type { AckResponse } from "@chao-game-online/shared/events";
import { PlaceStoneSchema, type PlaceStonePayload } from "@chao-game-online/shared/schemas/index";
import { gameService } from "@application/services/GameService";
import { lobbyService } from "@application/services/LobbyService";

export class GameHandler {
	constructor(
		private readonly io: MyServer,
		private readonly socket: AuthenticatedSocket
	) {}

	public registerListeners(): void {
		this.socket.on("room:start_game", this.handleStartGame.bind(this));
		this.socket.on("game:place_stone", this.handlePlaceStone.bind(this));
	}

	/**
	 * 'room:start_game' イベントを処理します。
	 * ホストからの要求で、ルームのゲームを開始します。
	 */
	private handleStartGame(ack: (res: AckResponse) => void) {
		const user = this.socket.data.user;
		const room = lobbyService.findRoomByUserId(user.uid);

		if (!room) {
			return ack({ success: false, error: "ルームに参加していません" });
		}
		if (!room.isFull()) {
			return ack({ success: false, error: "プレイヤーが全員そろっていません" });
		}
		// ホストでなければ開始できない
		if (room.toRoomStateDto().players.find((p) => p.isHost)?.id !== user.uid) {
			return ack({ success: false, error: "ホスト以外はゲームを開始できません" });
		}

		try {
			const game = gameService.startGame(room);
			// ルーム内の全クライアントにゲームの初期状態をブロードキャスト
			this.io.to(String(room.number)).emit("game:updated", game.toDto());
			ack({ success: true, data: null });
		} catch (e) {
			ack({ success: false, error: e instanceof Error ? e.message : "不明なエラー" });
		}
	}

	private handlePlaceStone(payload: PlaceStonePayload, ack: (res: AckResponse) => void) {
		const user = this.socket.data.user;
		const room = lobbyService.findRoomByUserId(user.uid);

		if (!room) {
			return ack({ success: false, error: "ルームに参加していません" });
		}

		const result = PlaceStoneSchema.safeParse(payload);
		if (!result.success) {
			return ack({ success: false, error: result.error.message });
		}

		try {
			const updatedGame = gameService.handlePlayerAction(room.number, user.uid, result.data.x, result.data.y);
			// ルーム内の全クライアントにゲーム状態をブロードキャスト
			this.io.to(String(room.number)).emit("game:updated", updatedGame.toDto());
			ack({ success: true, data: null });
		} catch (e) {
			ack({ success: false, error: e instanceof Error ? e.message : "不明なエラー" });
		}
	}
}
