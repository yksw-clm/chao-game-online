import type { RoomInfoDto, RoomStateDto } from "./dtos";
import type { CreateRoomPayload, JoinRoomPayload } from "./schemas";

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
}

export interface ServerToClientEvents {
	"lobby:rooms_updated": (rooms: RoomInfoDto[]) => void;

	"room:updated": (room: RoomStateDto) => void;
}
