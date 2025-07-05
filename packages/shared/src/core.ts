export const GameTypes = {
	FOUR_REVERSI: "four-reversi",
	FOUR_GOMOKU: "four-gomoku",
} as const;

export type GameType = (typeof GameTypes)[keyof typeof GameTypes];

export const GameTypeNames: Record<GameType, string> = {
	[GameTypes.FOUR_REVERSI]: "四人リバーシ",
	[GameTypes.FOUR_GOMOKU]: "四人五目並べ",
};
