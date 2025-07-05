import type { BoardState, PlayerId } from "@chao-game-online/shared/dtos";
import { useGameStore } from "./useGameStore";
import { useAuthStore } from "../auth/useAuthStore";

type GameBoardProps = {
	board: BoardState;
	colorMap: { [id: PlayerId]: string }; // colorMapを受け取る
	validMoves: { x: number; y: number }[];
	currentPlayerId: PlayerId;
};

export const GameBoard = ({ board, colorMap, validMoves, currentPlayerId }: GameBoardProps) => {
	const { placeStone } = useGameStore();
	const { user } = useAuthStore();

	const handleCellClick = (x: number, y: number) => {
		if (currentPlayerId !== user?.uid) return;
		if (!validMoves.some((move) => move.x === x && move.y === y)) return;

		placeStone({ x, y });
	};

	return (
		<div className="grid grid-cols-8 gap-1 p-2 bg-green-700 border-4 border-yellow-800">
			{board.map((row, y) =>
				row.map((cell, x) => {
					const isValidMove = validMoves.some((move) => move.x === x && move.y === y);
					const isMyTurn = currentPlayerId === user?.uid;

					return (
						<div
							key={`${y}-${x}`}
							className={`w-12 h-12 flex items-center justify-center border border-green-800 
								${isMyTurn && isValidMove ? "cursor-pointer bg-yellow-400 opacity-70" : ""}`}
							onClick={() => handleCellClick(x, y)}
						>
							{cell && <div className={`w-10 h-10 rounded-full ${colorMap[cell] ?? "bg-gray-400"}`} />}
						</div>
					);
				})
			)}
		</div>
	);
};
