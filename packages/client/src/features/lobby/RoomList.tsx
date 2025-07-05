import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RoomInfoDto } from "@chao-game-online/shared/dtos";
import { GameTypeNames } from "@chao-game-online/shared/core";

type RoomListProps = {
	rooms: RoomInfoDto[];
	onJoin: (roomNumber: number) => void;
};

export const RoomList = ({ rooms, onJoin }: RoomListProps) => {
	if (rooms.length === 0) {
		return (
			<div className="text-center py-10">
				<p className="text-muted-foreground">現在作成されているルームはありません。</p>
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>ルーム一覧</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ルーム番号</TableHead>
							<TableHead>ルーム名</TableHead>
							<TableHead>ゲーム</TableHead>
							<TableHead>参加人数</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{rooms.map((room) => (
							<TableRow key={room.number}>
								<TableCell>{room.number}</TableCell>
								<TableCell>{room.name}</TableCell>
								<TableCell>{GameTypeNames[room.gameType]}</TableCell>
								<TableCell>
									{room.playerCount} / {room.maxPlayerCount}
								</TableCell>
								<TableCell className="text-right">
									<Button onClick={() => onJoin(room.number)} disabled={room.playerCount >= room.maxPlayerCount}>
										参加
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};
