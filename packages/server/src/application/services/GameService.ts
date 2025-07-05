import { Game } from "@domain/Game";
import type { Room } from "@domain/Room";
import { User } from "@domain/User";

class GameService {
	private static _instance: GameService;
	// key: ルーム番号, value: Gameインスタンス
	private _games: Map<number, Game> = new Map();

	public static getInstance(): GameService {
		if (!GameService._instance) {
			GameService._instance = new GameService();
		}
		return GameService._instance;
	}

	/**
	 * 新しいゲームセッションを開始します。
	 * @param room ゲームを開始するルーム
	 * @returns Gameインスタンス
	 */
	public startGame(room: Room): Game {
		const players = room.toRoomStateDto().players.map((p) => User.create({ uid: p.id, displayName: p.displayName }));
		const game = Game.create(players);
		this._games.set(room.number, game);
		return game;
	}

	/**
	 * プレイヤーの操作を処理します。
	 * @param roomNumber 操作対象のルーム番号
	 * @param playerId 操作を行うプレイヤーID
	 * @param x X座標
	 * @param y Y座標
	 * @returns 更新されたGameインスタンス
	 */
	public handlePlayerAction(roomNumber: number, playerId: string, x: number, y: number): Game {
		const game = this.getGame(roomNumber);
		if (!game) {
			throw new Error("ゲームが見つかりません");
		}
		game.placeStone(playerId, x, y);
		return game;
	}

	public getGame(roomNumber: number): Game | undefined {
		return this._games.get(roomNumber);
	}

	/**
	 * 指定されたルームのゲームセッションを終了（削除）します。
	 * @param roomNumber 終了するゲームのルーム番号
	 */
	public endGame(roomNumber: number): void {
		this._games.delete(roomNumber);
		console.log(`Game for room #${roomNumber} has been ended.`);
	}
}

export const gameService = GameService.getInstance();
