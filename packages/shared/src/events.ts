import type { GameStateDto, RoomInfoDto, RoomStateDto } from "./dtos";
import type { CreateRoomPayload, JoinRoomPayload, PlaceStonePayload } from "./schemas";

export type AckResponse<T = null> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: string;
	  };

export interface ClientToServerEvents {
	"lobby:create": (payload: CreateRoomPayload, ack: (res: AckResponse<RoomStateDto>) => void) => void;
	"lobby:join": (payload: JoinRoomPayload, ack: (res: AckResponse<RoomStateDto>) => void) => void;

	"room:leave": (ack: (res: AckResponse) => void) => void;
	"room:start_game": (ack: (res: AckResponse) => void) => void;

	"game:place_stone": (payload: PlaceStonePayload, ack: (res: AckResponse) => void) => void;
}

export interface ServerToClientEvents {
	"lobby:rooms_updated": (rooms: RoomInfoDto[]) => void;

	"room:updated": (room: RoomStateDto) => void;

	"game:updated": (gameState: GameStateDto) => void;
}
