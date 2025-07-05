import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoomStore } from "@/features/room/useRoomStore";
import { useSocketStore } from "@/services/socket/useSocketStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { RoomStateDto } from "@chao-game-online/shared/dtos";

export const RoomPage = () => {
	const navigate = useNavigate();
	const { roomNumber } = useParams<{ roomNumber: string }>();
	const { socket } = useSocketStore();
	const { room, setRoom, leaveRoom } = useRoomStore();

	useEffect(() => {
		if (!socket) return;

		// サーバーからルーム情報更新イベントを受け取る
		const handleRoomUpdated = (updatedRoom: RoomStateDto) => {
			// このルームの情報であれば更新
			if (String(updatedRoom.number) === roomNumber) {
				setRoom(updatedRoom);
			}
		};

		socket.on("room:updated", handleRoomUpdated);

		// コンポーネントのアンマウント時にイベントリスナーを解除
		return () => {
			socket.off("room:updated", handleRoomUpdated);
		};
	}, [socket, setRoom, roomNumber]);

	const handleLeaveRoom = () => {
		leaveRoom(() => {
			alert("ルームから退室しました。");
			navigate("/lobby"); // ロビー画面へ遷移
		});
	};

	if (!room) {
		return <div className="container mx-auto p-4">ルーム情報を読み込み中...</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<header className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">
					ルーム: {room.name} (#{room.number})
				</h1>
				<Button onClick={handleLeaveRoom} variant="outline">
					退室する
				</Button>
			</header>
			<main>
				<Card>
					<CardHeader>
						<CardTitle>参加者一覧</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>プレイヤー名</TableHead>
									<TableHead>役割</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{room.players.map((player) => (
									<TableRow key={player.id}>
										<TableCell>{player.displayName}</TableCell>
										<TableCell>{player.isHost ? "ホスト" : "ゲスト"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</main>
		</div>
	);
};
