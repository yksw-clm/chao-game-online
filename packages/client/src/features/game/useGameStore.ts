import { create } from "zustand";
import { useSocketStore } from "@/services/socket/useSocketStore";
import type { GameStateDto, PlayerDto } from "@chao-game-online/shared/dtos";
import type { PlaceStonePayload } from "@chao-game-online/shared/schemas/index";

type GameState = {
	gameState: GameStateDto | null;
	gamePlayers: PlayerDto[] | null;
	setGameState: (gameState: GameStateDto) => void;
	setGamePlayers: (players: PlayerDto[]) => void;
	placeStone: (payload: PlaceStonePayload) => void;
};

export const useGameStore = create<GameState>((set) => ({
	gameState: null,
	gamePlayers: null,
	setGameState: (gameState) => set({ gameState }),
	setGamePlayers: (players) => set({ gamePlayers: players }),
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
