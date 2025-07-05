import { useEffect } from "react";
import { useSocketStore } from "@/services/socket/useSocketStore";
import { useLobbyStore } from "@/features/lobby/useLobbyStore";
import type { RoomInfoDto } from "@chao-game-online/shared/dtos";
import { CreateRoomModal } from "@/features/lobby/CreateRoomModal";
import { RoomList } from "@/features/lobby/RoomList";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";
import { useRoomStore } from "@/features/room/useRoomStore";
import { useNavigate } from "react-router-dom";

export const LobbyPage = () => {
	const { socket } = useSocketStore();
	const { rooms, setRooms, joinRoom } = useLobbyStore();
	const { setRoom } = useRoomStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!socket) return;

		// サーバーからルーム一覧更新イベントを受け取る
		const handleRoomsUpdated = (updatedRooms: RoomInfoDto[]) => {
			setRooms(updatedRooms);
		};

		socket.on("lobby:rooms_updated", handleRoomsUpdated);

		// コンポーネントのアンマウント時にイベントリスナーを解除
		return () => {
			socket.off("lobby:rooms_updated", handleRoomsUpdated);
		};
	}, [socket, setRooms]);

	const handleJoinRoom = (roomNumber: number) => {
		joinRoom({ roomNumber }, (res) => {
			if (res.success) {
				setRoom(res.data); // ルーム情報をストアに保存
				navigate(`/room/${res.data.number}`); // ルーム画面へ遷移
			} else {
				alert(`ルームへの参加に失敗しました: ${res.error}`);
			}
		});
	};

	const handleLogout = () => {
		signOut(auth).catch((error) => {
			console.error("ログアウトエラー:", error);
			alert("ログアウトに失敗しました。");
		});
		// signOutが成功すると、onAuthStateChangedが発火し、
		// useAuthStoreの状態が更新され、ProtectedRouteによって自動的に "/" へリダイレクトされます。
	};

	return (
		<div className="container mx-auto p-4">
			<header className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">ロビー</h1>
				<div>
					<CreateRoomModal />
					<Button onClick={handleLogout} variant="outline" className="ml-2">
						ログアウト
					</Button>
				</div>
			</header>
			<main>
				<RoomList rooms={rooms} onJoin={handleJoinRoom} />
			</main>
		</div>
	);
};
