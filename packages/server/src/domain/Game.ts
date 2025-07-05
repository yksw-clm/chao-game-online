import type { BoardState, GameStateDto, PlayerId } from "@chao-game-online/shared/dtos";
import type { User } from "./User";

/**
 * 四人リバーシのゲーム進行状態やルールを管理するドメインエンティティです。
 */
export class Game {
	private _board: BoardState;
	private _players: User[];
	private _currentPlayerIndex: number;
	private _isGameOver: boolean = false;
	private _winner: PlayerId | null = null;
	private _scores: { [id: string]: number } | null = null;
	private _consecutivePasses: number = 0; // 連続パスのカウンター
	public readonly boardSize: number = 8;
	private readonly DIRECTIONS = [
		{ y: -1, x: -1 },
		{ y: -1, x: 0 },
		{ y: -1, x: 1 },
		{ y: 0, x: -1 },
		/* {y:0, x:0} */ { y: 0, x: 1 },
		{ y: 1, x: -1 },
		{ y: 1, x: 0 },
		{ y: 1, x: 1 },
	];

	private constructor(players: User[]) {
		this._players = players;
		this._currentPlayerIndex = 0;
		this._board = Array(this.boardSize)
			.fill(null)
			.map(() => Array(this.boardSize).fill(null));

		// 引数で渡されたプレイヤーのIDを取得 (黒→白→赤→青の順)
		const p0 = this._players[0]?.uid; // 黒
		const p1 = this._players[1]?.uid; // 白
		const p2 = this._players[2]?.uid; // 赤
		const p3 = this._players[3]?.uid; // 青

		// 画像に基づいた初期配置を設定します
		if (p0 && p1 && p2 && p3) {
			this._board[3]![3] = p0; // 黒
			this._board[4]![2] = p0; // 黒
			this._board[3]![5] = p1; // 白
			this._board[4]![4] = p1; // 白
			this._board[2]![3] = p2; // 赤
			this._board[3]![4] = p2; // 赤
			this._board[4]![3] = p3; // 青
			this._board[5]![4] = p3; // 青
		}
	}

	/**
	 * 新しいGameインスタンスを生成します。
	 * @param players ゲームに参加するプレイヤーの配列 (黒、白、赤、青の順)
	 * @returns Gameの新しいインスタンス
	 */
	public static create(players: User[]): Game {
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
	 */
	public placeStone(playerId: PlayerId, x: number, y: number): void {
		if (this._isGameOver) throw new Error("ゲームは終了しています");

		const player = this.getCurrentPlayer();
		if (!player || player.uid !== playerId) throw new Error("あなたのターンではありません");

		const piecesToFlip = this.getPiecesToFlip(x, y, playerId);
		if (piecesToFlip.length === 0) throw new Error("そこには置けません");
		if (this.isAnnihilationMove(piecesToFlip, playerId)) throw new Error("全滅手は禁止されています");

		// 石を置き、駒を裏返す
		this._board[y]![x] = playerId;
		piecesToFlip.forEach((pos) => {
			this._board[pos.y]![pos.x] = playerId;
		});

		this._consecutivePasses = 0; // パスカウンターをリセット
		this.advanceToNextTurn();
	}

	/**
	 * 現在のプレイヤーが置ける有効な手のリストを取得します。
	 * @returns 有効な手の座標の配列
	 */
	public getValidMoves(): { x: number; y: number }[] {
		const player = this.getCurrentPlayer();
		if (!player) return [];

		const validMoves = [];
		for (let y = 0; y < this.boardSize; y++) {
			for (let x = 0; x < this.boardSize; x++) {
				if (this._board[y]![x] !== null) continue; // 既に石がある

				const piecesToFlip = this.getPiecesToFlip(x, y, player.uid);
				if (piecesToFlip.length > 0 && !this.isAnnihilationMove(piecesToFlip, player.uid)) {
					validMoves.push({ x, y });
				}
			}
		}
		return validMoves;
	}

	/**
	 * 次の手番に進めます。
	 * 有効な手がないプレイヤーは自動的にパスされます。
	 */
	private advanceToNextTurn() {
		for (let i = 0; i < this._players.length; i++) {
			this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;
			if (this.getValidMoves().length > 0) {
				// 次のプレイヤーに有効な手があれば、そのプレイヤーのターンになる
				this.updateGameStatus();
				return;
			}
			// 有効な手がない場合はパス
			this._consecutivePasses++;
		}

		// 1周しても誰も置く場所がなければゲーム終了
		this.updateGameStatus(true);
	}

	/**
	 * ゲームの終了状態をチェックし、勝者を決定します。
	 * @param forceEnd 4人連続パスなどで強制的に終了させるか
	 */
	private updateGameStatus(forceEnd: boolean = false) {
		if (this._consecutivePasses >= this._players.length || forceEnd) {
			this._isGameOver = true;

			const scores: { [id: string]: number } = {};
			this._players.forEach((p) => (scores[p.uid] = 0));

			for (let y = 0; y < this.boardSize; y++) {
				for (let x = 0; x < this.boardSize; x++) {
					const cell = this._board[y]![x];
					if (cell) {
						scores[cell] = (scores[cell] ?? 0) + 1;
					}
				}
			}
			this._scores = scores;

			let maxScore = -1;
			let winnerId: PlayerId | null = null;
			for (const playerId in scores) {
				if (scores[playerId]! > maxScore) {
					maxScore = scores[playerId]!;
					winnerId = playerId;
				} else if (scores[playerId] === maxScore) {
					winnerId = null; // 引き分け
				}
			}
			this._winner = winnerId;
		}
	}

	/**
	 * 指定されたマスに石を置いた場合に裏返る駒のリストを取得します。
	 * @returns 裏返る駒の座標の配列。裏返る駒がなければ空配列。
	 */
	private getPiecesToFlip(x: number, y: number, playerId: PlayerId): { x: number; y: number }[] {
		if (this._board[y]?.[x] !== null) return [];

		const allFlips: { x: number; y: number }[] = [];
		this.DIRECTIONS.forEach((dir) => {
			let currentLine: { x: number; y: number }[] = [];
			let currentX = x + dir.x;
			let currentY = y + dir.y;

			while (currentX >= 0 && currentX < this.boardSize && currentY >= 0 && currentY < this.boardSize) {
				const cell = this._board[currentY]![currentX];
				if (!cell) break; // 空白マス
				if (cell === playerId) {
					// 自分の石で挟んだ
					allFlips.push(...currentLine);
					break;
				}
				currentLine.push({ x: currentX, y: currentY });
				currentX += dir.x;
				currentY += dir.y;
			}
		});
		return allFlips;
	}

	/**
	 * ある手が「全滅手」であるかどうかを判定します。
	 * @returns 全滅手であれば true
	 */
	private isAnnihilationMove(piecesToFlip: { x: number; y: number }[], ownPlayerId: PlayerId): boolean {
		const pieceOwnersToFlip = new Set(piecesToFlip.map((p) => this._board[p.y]![p.x]));

		for (const ownerId of pieceOwnersToFlip) {
			if (ownerId === null || ownerId === ownPlayerId) continue;

			// 裏返される駒の持ち主の現在の駒数を数える
			let count = 0;
			for (let y = 0; y < this.boardSize; y++) {
				for (let x = 0; x < this.boardSize; x++) {
					if (this._board[y]![x] === ownerId) {
						count++;
					}
				}
			}

			// そのプレイヤーの駒が、裏返される駒の数と等しい場合、全滅となる
			const flipCountForOwner = piecesToFlip.filter((p) => this._board[p.y]![p.x] === ownerId).length;
			if (count === flipCountForOwner) {
				return true; // 全滅手なのでtrue
			}
		}
		return false;
	}

	/**
	 * 現在の手番のプレイヤー情報を取得します。
	 */
	public getCurrentPlayer(): User | undefined {
		return this._players[this._currentPlayerIndex];
	}

	/**
	 * クライアントへ送信するためのゲーム状態DTOを生成します。
	 */
	public toDto(): GameStateDto {
		return {
			board: this._board,
			currentPlayerId: this.getCurrentPlayer()?.uid ?? "",
			winner: this._winner,
			isGameOver: this._isGameOver,
			validMoves: this.getValidMoves(),
			scores: this._scores,
		};
	}
}
