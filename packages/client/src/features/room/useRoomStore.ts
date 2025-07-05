import { create } from "zustand";
import type { RoomStateDto } from "@chao-game-online/shared/dtos";
import { useSocketStore } from "@/services/socket/useSocketStore";

type RoomState = {
	room: RoomStateDto | null;
	setRoom: (room: RoomStateDto | null) => void;
	leaveRoom: (callback: () => void) => void;
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
}));
