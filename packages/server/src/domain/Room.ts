import { type GameType, GameTypes } from "@chao-game-online/shared/core";
import { User } from "./User";
import type { PlayerDto, RoomInfoDto, RoomStateDto } from "@chao-game-online/shared/dtos";

/** ルームの初期化用プロパティ */
type RoomProps = {
	name: string;
	gameType: GameType;
	host: User;
};

/**
 * ルームを表すドメインエンティティ。
 * 不変条件（ルーム番号、ルーム名、ゲームタイプ）と、関連する振る舞いをカプセル化する。
 */
export class Room {
	/** ルームを一意に識別するための番号。 */
	public readonly number: number;
	/** ルームの名。3文字以上20文字以内。*/
	public readonly name: string;
	/** ルームでプレイされるゲームの種類。 */
	public readonly gameType: GameType;
	/** 最大プレイヤー数。将来的にはゲームの種類に応じて変更可能。 */
	public readonly maxPlayerCount: number = 4;

	private _players: Map<string, User> = new Map();
	private _hostId: string;

	private constructor(number: number, props: RoomProps) {
		this.number = number;
		this.name = props.name;
		this.gameType = props.gameType;
		this._hostId = props.host.uid;

		// ホストをプレイヤーとして追加
		this.addPlayer(props.host);
	}

	/**
	 * Roomインスタンスを生成するためのファクトリメソッド。
	 * @param number ルーム番号（5桁の正の整数）
	 * @param props ルームの初期プロパティ
	 * @returns Roomインスタンス
	 * @throws Error - 不変条件を満たさない場合（ルーム番号が5桁でない、ルーム名が短すぎる/長すぎる、無効なゲームタイプなど）
	 */
	public static create(number: number, props: RoomProps): Room {
		// ここで初期化時のバリデーションを行う
		if (number < 10000 || number > 99999) {
			throw new Error("ルーム番号は5桁の正の整数である必要があります");
		}
		if (props.name.length < 3) {
			throw new Error("ルーム名は3文字以上である必要があります");
		}
		if (props.name.length > 20) {
			throw new Error("ルーム名は20文字以下である必要があります");
		}
		if (!Object.values(GameTypes).includes(props.gameType)) {
			throw new Error("無効なゲームタイプです");
		}

		return new Room(number, props);
	}

	/**
	 * ルームにプレイヤーを追加します。
	 * @param user ルームに参加するユーザー
	 * @throws Error - ルームが満員の場合
	 */
	public addPlayer(user: User): void {
		if (this.isFull()) {
			throw new Error("このルームは満員です");
		}
		this._players.set(user.uid, user);
	}

	/**
	 * ルームからプレイヤーを削除します。
	 * ホストが退室した場合、残っているプレイヤーがいれば新しいホストを自動的に指定します。
	 * @param userId 削除するユーザーのID
	 * @throws Error - 指定されたユーザーがこのルームに存在しない場合
	 */
	public removePlayer(userId: string): void {
		if (!this._players.has(userId)) {
			throw new Error("指定されたユーザーはこのルームに存在しません");
		}
		this._players.delete(userId);

		// ホストが削除された場合、残っているプレイヤーがいれば新しいホストを指定
		if (this._hostId === userId && this.getPlayerCount() > 0) {
			this._hostId = this._players.keys().next().value!;
		}
	}

	/**
	 * 指定されたIDのプレイヤーを取得します。
	 * @param userId プレイヤーのID
	 * @returns プレイヤー情報
	 */
	public getPlayer(userId: string): User | undefined {
		return this._players.get(userId);
	}

	/**
	 * ルームに参加しているプレイヤーの数を取得します。
	 * @returns プレイヤーの数
	 */
	public getPlayerCount(): number {
		return this._players.size;
	}

	/**
	 * ルームが空かどうかを確認します。
	 * @returns 空の場合はtrue、そうでない場合はfalse
	 */
	public isEmpty(): boolean {
		return this.getPlayerCount() === 0;
	}

	/**
	 * ルームが満員かどうかを確認します。
	 * @returns 満員の場合はtrue、そうでない場合はfalse
	 */
	public isFull(): boolean {
		return this.getPlayerCount() >= this.maxPlayerCount;
	}

	/**
	 * ロビー一覧で表示するための情報を持つDTOに変換します。
	 * @returns ロビー表示用のルーム情報DTO
	 */
	public toRoomInfoDto(): RoomInfoDto {
		return {
			number: this.number,
			name: this.name,
			gameType: this.gameType,
			playerCount: this.getPlayerCount(),
			maxPlayerCount: this.maxPlayerCount,
		};
	}

	/**
	 * ルーム内の詳細な状態を表すDTOに変換します。
	 * @returns ルーム状態DTO
	 */
	public toRoomStateDto(): RoomStateDto {
		const playersDto: PlayerDto[] = Array.from(this._players.values()).map((user) => ({
			id: user.uid,
			displayName: user.displayName,
			isHost: user.uid === this._hostId,
		}));

		return {
			number: this.number,
			name: this.name,
			gameType: this.gameType,
			players: playersDto,
			maxPlayerCount: this.maxPlayerCount,
		};
	}
}
