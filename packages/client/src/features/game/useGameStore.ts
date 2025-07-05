import { create } from "zustand";
import { useSocketStore } from "@/services/socket/useSocketStore";
import type { GameStateDto } from "@chao-game-online/shared/dtos";
import type { PlaceStonePayload } from "@chao-game-online/shared/schemas/index";

type GameState = {
	gameState: GameStateDto | null;
	setGameState: (gameState: GameStateDto) => void;
	placeStone: (payload: PlaceStonePayload) => void;
};

export const useGameStore = create<GameState>((set) => ({
	gameState: null,
	setGameState: (gameState) => set({ gameState }),
	placeStone: (payload) => {
		const { socket } = useSocketStore.getState();
		if (!socket) return alert("ソケットが接続されていません");

		socket.emit("game:place_stone", payload, (res) => {
			if (!res.success) {
				alert(`操作に失敗しました: ${res.error}`);
			}
		});
	},
}));
