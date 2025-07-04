import { SocketServer } from "./interfaces/socket";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const server = new SocketServer(process.env.CLIENT_ORIGIN || "*");

server.listen(port);
