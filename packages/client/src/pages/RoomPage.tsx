import { useState, useEffect, useMemo } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const RoomPage = () => {
	const navigate = useNavigate();
	const { roomNumber } = useParams<{ roomNumber: string }>();
	const { socket } = useSocketStore();
	const { room, setRoom, leaveRoom, startGame } = useRoomStore();
	const { user } = useAuthStore(); // ログインユーザー情報を取得
	const [isResultModalOpen, setIsResultModalOpen] = useState(false);
	const { gameState, setGameState, gamePlayers, setGamePlayers } = useGameStore();

	// プレイヤーIDと色のマッピングを作成
	const colorMap = useMemo(() => {
		if (!room) return {};
		const colors = ["bg-black", "bg-white", "bg-red-500", "bg-blue-500"];
		const map: { [id: string]: string } = {};
		room.players.forEach((player, index) => {
			map[player.id] = colors[index] ?? "bg-gray-400";
		});
		return map;
	}, [gamePlayers]);

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
			// ゲームが開始された瞬間を検知
			const currentGameState = useGameStore.getState().gameState;
			if (!currentGameState && newGameState) {
				// その時点のルーム参加者をゲームプレイヤーとして保存
				const currentRoom = useRoomStore.getState().room;
				if (currentRoom) {
					setGamePlayers(currentRoom.players);
				}
			}

			// ゲームが「今」終了したかを判定
			if (currentGameState && !currentGameState.isGameOver && newGameState.isGameOver) {
				setIsResultModalOpen(true); // モーダルを自動で開く
			}

			setGameState(newGameState);
		};

		socket.on("room:updated", handleRoomUpdated);
		socket.on("game:updated", handleGameStateUpdated);

		// コンポーネントのアンマウント時にイベントリスナーを解除
		return () => {
			socket.off("room:updated", handleRoomUpdated);
			socket.off("game:updated", handleGameStateUpdated);
		};
	}, [socket, setRoom, roomNumber, setGameState, setGamePlayers]);

	const winnerName = useMemo(() => {
		if (!gameState?.winner) return "引き分け";
		return gamePlayers?.find((p) => p.id === gameState.winner)?.displayName ?? "不明";
	}, [gameState?.winner, gamePlayers]);

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
				<div>
					{gameState?.isGameOver && (
						<Button onClick={() => setIsResultModalOpen(true)} variant="secondary" className="mr-2">
							結果を表示
						</Button>
					)}
					<Button onClick={handleLeaveRoom} variant="outline">
						退室する
					</Button>
				</div>
			</header>
			<main className="grid grid-cols-3 gap-4">
				<div className="col-span-2">
					{gameState ? (
						<GameBoard
							board={gameState.board}
							colorMap={colorMap}
							validMoves={gameState.validMoves}
							currentPlayerId={gameState.currentPlayerId}
						/>
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
									<TableRow key={player.id} className={gameState?.currentPlayerId === player.id ? "bg-yellow-100 font-bold" : ""}>
										<TableCell>{player.displayName}</TableCell>
										<TableCell>{player.isHost ? "ホスト" : "ゲスト"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</main>

			<Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ゲーム結果</DialogTitle>
						<DialogDescription>勝者: {winnerName}</DialogDescription>
					</DialogHeader>
					<div>
						<h3 className="font-bold mb-2">スコア</h3>
						<ul>
							{gameState?.scores &&
								room.players.map((player) => (
									<li key={player.id} className="flex justify-between">
										<span>{player.displayName}</span>
										<span>{gameState.scores?.[player.id] ?? 0}</span>
									</li>
								))}
						</ul>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
