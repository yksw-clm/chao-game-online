import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@chao-game-online/shared/events"; //

type SocketState = {
	socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
	isConnected: boolean;
	connect: (token: string) => void;
	disconnect: () => void;
};

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL;

export const useSocketStore = create<SocketState>((set) => ({
	socket: null,
	isConnected: false,
	connect: (token) => {
		const newSocket = io(SOCKET_URL, {
			auth: { token },
			transports: ["websocket"],
		});

		newSocket.on("connect", () => {
			set({ isConnected: true });
			console.log("Socket.IO connected!");
		});

		newSocket.on("disconnect", () => {
			set({ isConnected: false });
			console.log("Socket.IO disconnected.");
		});

		set({ socket: newSocket });
	},
	disconnect: () => {
		set((state) => {
			state.socket?.disconnect();
			return { socket: null, isConnected: false };
		});
	},
}));
