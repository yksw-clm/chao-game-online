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
