import { io } from "socket.io-client";
import { envConfig } from "@/config";

export const socket = io(envConfig.SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});
