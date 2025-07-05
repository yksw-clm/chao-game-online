import type { GameType } from "./core";

export type RoomInfoDto = {
	number: number;
	name: string;
	gameType: GameType;
	playerCount: number;
	maxPlayerCount: number;
};

export type PlayerDto = {
	id: string;
	displayName: string;
	isHost: boolean;
};

export type RoomStateDto = {
	number: number;
	name: string;
	gameType: GameType;
	players: PlayerDto[];
	maxPlayerCount: number;
};

export type PlayerId = string;
export type CellState = PlayerId | null;
export type BoardState = CellState[][];

export type GameStateDto = {
	board: BoardState;
	currentPlayerId: PlayerId;
	winner: PlayerId | null;
	isGameOver: boolean;
	validMoves: { x: number; y: number }[];
	scores: { [id: PlayerId]: number } | null;
};
