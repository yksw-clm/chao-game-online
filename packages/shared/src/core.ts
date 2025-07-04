export enum GameType {
	"four-reversi",
	"four-gomoku",
}

export const GameTypeNames: Record<GameType, string> = {
	[GameType["four-reversi"]]: "四人リバーシ",
	[GameType["four-gomoku"]]: "四人五目並べ",
};
