import type { BoardState, GameStateDto, PlayerId } from "@chao-game-online/shared/dtos";
import type { User } from "./User";

/**
 * ゲームの進行状態やルールを管理するドメインエンティティです。
 */
export class Game {
	private _board: BoardState;
	private _players: User[];
	private _currentPlayerIndex: number;
	private _isGameOver: boolean = false;
	private _winner: PlayerId | null = null;
	public readonly boardSize: number = 8; // 盤のサイズ（8x8）

	private constructor(players: User[]) {
		this._players = players;
		this._currentPlayerIndex = 0;
		this._board = Array(this.boardSize)
			.fill(null)
			.map(() => Array(this.boardSize).fill(null));
		// TODO: 初期配置を設定する
	}

	/**
	 * 新しいGameインスタンスを生成します。
	 * @param players ゲームに参加するプレイヤーの配列
	 * @returns Gameの新しいインスタンス
	 */
	public static create(players: User[]): Game {
		// 簡易的なバリデーション
		if (players.length < 4) {
			throw new Error("ゲームは4人のプレイヤーで開始する必要があります");
		}
		return new Game(players);
	}

	/**
	 * 盤面に石を置く操作を実行します。
	 * @param playerId 操作を行うプレイヤーのID
	 * @param x X座標
	 * @param y Y座標
	 * @throws Error - 手番でない、または無効な場所に置こうとした場合にエラーをスローします。
	 */
	public placeStone(playerId: PlayerId, x: number, y: number): void {
		if (this._isGameOver) throw new Error("ゲームは終了しています");
		// getCurrentPlayer()がundefinedになる可能性がないことを`!`で明示
		if (this.getCurrentPlayer()!.uid !== playerId) throw new Error("あなたのターンではありません");
		if (!this.isValidMove(x, y)) throw new Error("そこには置けません");

		// 盤面の該当箇所に石を置く
		const row = this._board[y];
		if (row) {
			row[x] = playerId;
		}

		// TODO: 勝敗判定ロジック
		this.checkWinner();

		// ターンを次のプレイヤーへ
		this.nextTurn();
	}

	private isValidMove(x: number, y: number): boolean {
		// `this._board[y]`がundefinedでないことを確認してからアクセス
		const row = this._board[y];
		if (!row) return false;
		// TODO: ゲームルールに基づいた配置可能かどうかの判定
		return row[x] === null;
	}

	private nextTurn(): void {
		this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;
	}

	private checkWinner(): void {
		// TODO: 勝敗判定を行い、_isGameOverと_winnerを更新する
	}

	/**
	 * 現在の手番のプレイヤー情報を取得します。
	 * @returns 現在のプレイヤーのUserインスタンス、またはundefined
	 */
	public getCurrentPlayer(): User | undefined {
		return this._players[this._currentPlayerIndex];
	}

	/**
	 * クライアントへ送信するためのゲーム状態DTO（Data Transfer Object）を生成します。
	 * @returns ゲーム状態を表すDTO
	 */
	public toDto(): GameStateDto {
		return {
			board: this._board,
			// getCurrentPlayer()がundefinedになる可能性を考慮
			currentPlayerId: this.getCurrentPlayer()?.uid ?? "",
			winner: this._winner,
			isGameOver: this._isGameOver,
		};
	}
}
