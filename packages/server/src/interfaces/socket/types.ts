import type { ClientToServerEvents, ServerToClientEvents } from "@chao-game-online/shared/events";
import { User } from "@domain/User";
import type { Server, Socket } from "socket.io";

export type SocketData = { user: User };
// Record<string, never>は、プロパティを一切持たないオブジェクトを表している。
export type AuthenticatedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type MyServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
