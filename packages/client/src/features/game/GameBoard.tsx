import type { BoardState } from "@chao-game-online/shared/dtos";
import { useGameStore } from "./useGameStore";

type GameBoardProps = {
	board: BoardState;
};

export const GameBoard = ({ board }: GameBoardProps) => {
	const { placeStone } = useGameStore();

	const handleCellClick = (x: number, y: number) => {
		// TODO: クリック可能かどうかの判定（自分のターンか、配置可能かなど）
		placeStone({ x, y });
	};

	return (
		<div className="grid grid-cols-8 gap-1 p-2 bg-green-700 border-4 border-yellow-800">
			{board.map((row, y) =>
				row.map((cell, x) => (
					<div
						key={`${y}-${x}`}
						className="w-12 h-12 flex items-center justify-center border border-green-800 cursor-pointer"
						onClick={() => handleCellClick(x, y)}
					>
						{cell && <div className={`w-10 h-10 rounded-full ${cell === "player1_id" ? "bg-black" : "bg-white"}`} />}
					</div>
				))
			)}
		</div>
	);
};
