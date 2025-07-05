import { create } from "zustand";
import type { RoomInfoDto } from "@chao-game-online/shared/dtos";
import { useSocketStore } from "@/services/socket/useSocketStore";
import type { ClientToServerEvents } from "@chao-game-online/shared/events";

type LobbyState = {
	rooms: RoomInfoDto[];
	setRooms: (rooms: RoomInfoDto[]) => void;
	createRoom: ClientToServerEvents["lobby:create"];
	joinRoom: ClientToServerEvents["lobby:join"];
};

export const useLobbyStore = create<LobbyState>((set) => ({
	rooms: [],
	setRooms: (rooms) => set({ rooms }),
	createRoom: (payload, callback) => {
		const { socket } = useSocketStore.getState();
		if (!socket) return alert("ソケットが接続されていません");

		socket.emit("lobby:create", payload, (res) => {
			callback(res);
		});
	},
	joinRoom: (roomNumber, callback) => {
		const { socket } = useSocketStore.getState();
		if (!socket) return alert("ソケットが接続されていません");

		socket.emit("lobby:join", roomNumber, (res) => {
			callback(res);
		});
	},
}));
