import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoomStore } from "@/features/room/useRoomStore";
import { useSocketStore } from "@/services/socket/useSocketStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { GameStateDto, RoomStateDto } from "@chao-game-online/shared/dtos";
import { useGameStore } from "@/features/game/useGameStore";
import { GameBoard } from "@/features/game/GameBoard";
import { useAuthStore } from "@/features/auth/useAuthStore";

export const RoomPage = () => {
	const navigate = useNavigate();
	const { roomNumber } = useParams<{ roomNumber: string }>();
	const { socket } = useSocketStore();
	const { room, setRoom, leaveRoom, startGame } = useRoomStore();
	const { user } = useAuthStore(); // ログインユーザー情報を取得
	const { gameState, setGameState } = useGameStore();

	// 現在のユーザーがホストかどうかを判定
	const isHost = room?.players.find((p) => p.isHost)?.id === user?.uid;
	// ゲーム開始ボタンを表示する条件
	const canStartGame = isHost && room?.players.length === room?.maxPlayerCount && !gameState;

	useEffect(() => {
		if (!socket) return;

		// サーバーからルーム情報更新イベントを受け取る
		const handleRoomUpdated = (updatedRoom: RoomStateDto) => {
			// このルームの情報であれば更新
			if (String(updatedRoom.number) === roomNumber) {
				setRoom(updatedRoom);
			}
		};

		const handleGameStateUpdated = (newGameState: GameStateDto) => {
			setGameState(newGameState);
		};

		socket.on("room:updated", handleRoomUpdated);
		socket.on("game:updated", handleGameStateUpdated);

		// コンポーネントのアンマウント時にイベントリスナーを解除
		return () => {
			socket.off("room:updated", handleRoomUpdated);
			socket.off("game:updated", handleGameStateUpdated);
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
			<main className="grid grid-cols-3 gap-4">
				<div className="col-span-2">
					{gameState ? (
						<GameBoard board={gameState.board} />
					) : (
						<div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
							<p className="text-muted-foreground">
								{canStartGame ? (
									<Button onClick={startGame} size="lg">
										ゲーム開始
									</Button>
								) : (
									"ゲーム開始待機中..."
								)}
							</p>
						</div>
					)}
				</div>
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
