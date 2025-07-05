import { create } from "zustand";
import type { RoomStateDto } from "@chao-game-online/shared/dtos";
import { useSocketStore } from "@/services/socket/useSocketStore";

type RoomState = {
	room: RoomStateDto | null;
	setRoom: (room: RoomStateDto | null) => void;
	leaveRoom: (callback: () => void) => void;
	startGame: () => void;
};

export const useRoomStore = create<RoomState>((set) => ({
	room: null,
	setRoom: (room) => set({ room }),
	leaveRoom: (callback) => {
		const { socket } = useSocketStore.getState();
		if (!socket) return alert("ソケットが接続されていません");

		// サーバーに room:leave イベントを送信
		socket.emit("room:leave", (res) => {
			if (res.success) {
				set({ room: null }); // ストアのルーム情報をクリア
				callback(); // 成功時のコールバックを実行
			} else {
				alert(`ルームの退室に失敗しました: ${res.error}`);
			}
		});
	},
	startGame: () => {
		const { socket } = useSocketStore.getState();
		if (!socket) return alert("ソケットが接続されていません");

		// サーバーに room:start_game イベントを送信
		socket.emit("room:start_game", (res) => {
			if (!res.success) {
				alert(`ゲームの開始に失敗しました: ${res.error}`);
			}
			// 成功した場合、サーバーからの game:updated イベントで画面が更新される
		});
	},
}));
