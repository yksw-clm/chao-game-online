import type { ClientToServerEvents, ServerToClientEvents } from "@chao-game-online/shared/events";
import { User } from "@domain/User";
import type { Server, Socket } from "socket.io";

export type SocketData = { user: User };
export type AuthenticatedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
export type MyServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
