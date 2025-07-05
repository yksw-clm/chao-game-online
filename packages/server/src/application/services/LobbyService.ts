import { GameType } from "@chao-game-online/shared/core";
import type { RoomInfoDto } from "@chao-game-online/shared/dtos";
import { Room } from "@domain/Room";
import { User } from "@domain/User";

/**
 * アプリケーション全体のルーム（インメモリ）を管理するシングルトンサービス。
 * すべてのルームインスタンスの生成、検索、削除といったライフサイクルを管理する。
 * 実質的なインメモリリポジトリとして機能する。
 */
class LobbyService {
	private static _instance: LobbyService;
	// key: ルーム番号, value: Roomインスタンス
	private _rooms: Map<number, Room> = new Map();

	private constructor() {}

	/**
	 * LobbyServiceのシングルトンインスタンスを取得する。
	 * @returns LobbyServiceのインスタンス
	 */
	public static getInstance(): LobbyService {
		if (!LobbyService._instance) {
			LobbyService._instance = new LobbyService();
		}
		return LobbyService._instance;
	}

	/**
	 * 新しいルームを作成し、ロビーに追加します。
	 * @param host ルームを作成するユーザー（ホスト）
	 * @param name ルーム名
	 * @param gameType ゲームの種類
	 * @returns 生成されたRoomインスタンス
	 */
	public createRoom(host: User, name: string, gameType: GameType): Room {
		const roomNumber = this.generateUniqueRoomNumber();
		const room = Room.create(roomNumber, {
			host,
			name,
			gameType,
		});
		this._rooms.set(roomNumber, room);
		return room;
	}

	/**
	 * 既存のルームにプレイヤーを参加させます。
	 * @param user 参加するユーザー
	 * @param roomNumber 参加するルームの番号
	 * @returns 参加後のRoomインスタンス
	 * @throws 指定されたルームが存在しない場合や、満員の場合にエラー
	 */
	public joinRoom(user: User, roomNumber: number): Room {
		const room = this._rooms.get(roomNumber);
		if (!room) {
			throw new Error("指定されたルームは存在しません");
		}
		room.addPlayer(user);
		return room;
	}

	/**
	 * プレイヤーが現在いるルームから退出させます。
	 * 退出後にルームが空になった場合、そのルームはロビーから削除されます。
	 * @param userId 退出するプレイヤーのID
	 * @returns プレイヤー退出後のRoomインスタンス。ルームが削除された場合は `undefined`。
	 */
	public leaveRoom(userId: string): Room | undefined {
		const roomNumber = this.findRoomNumberByUserId(userId);
		if (!roomNumber) return undefined;

		const room = this._rooms.get(roomNumber);
		if (!room) return undefined;

		room.removePlayer(userId);

		// ルームが空になったら削除
		if (room.isEmpty()) {
			this._rooms.delete(roomNumber);
			return undefined; // ルームが削除されたことを示す
		}
		return room;
	}

	/**
	 * 指定したユーザーIDが属するルームを検索します。
	 * @param userId 検索するユーザーのID
	 * @returns 見つかったRoomインスタンス。見つからない場合は `undefined`。
	 */
	public findRoomByUserId(userId: string): Room | undefined {
		for (const room of this._rooms.values()) {
			if (room.getPlayer(userId)) return room;
		}
		return undefined;
	}

	/**
	 * 指定したユーザーIDが属するルーム番号を検索します。
	 * @param userId 検索するユーザーのID
	 * @returns 見つかったルーム番号。見つからない場合は `undefined`。
	 */
	private findRoomNumberByUserId(userId: string): number | undefined {
		for (const [number, room] of this._rooms.entries()) {
			if (room.getPlayer(userId)) {
				return number;
			}
		}
		return undefined;
	}

	/**
	 * 指定したルーム番号のルームを取得します。
	 * @param roomNumber 取得するルームの番号
	 * @returns Roomインスタンス。存在しない場合は `undefined`。
	 */
	public getRoom(roomNumber: number): Room | undefined {
		return this._rooms.get(roomNumber);
	}

	/**
	 * ロビーに表示するために、存在するすべてのルームの情報をDTOの配列として取得します。
	 * @returns 全ルームの`RoomInfoDto`配列
	 */
	public getAllRoomsInfoDtos(): RoomInfoDto[] {
		return Array.from(this._rooms.values()).map((room) => room.toRoomInfoDto());
	}

	/**
	 * 現在存在しない、一意のルーム番号を生成します。
	 * @returns 5桁のユニークなルーム番号
	 */
	private generateUniqueRoomNumber(): number {
		let roomNumber: number;
		do {
			roomNumber = Math.floor(Math.random() * 90000) + 10000; // 10000〜99999の範囲
		} while (this._rooms.has(roomNumber));
		return roomNumber;
	}
}

export const lobbyService = LobbyService.getInstance();
