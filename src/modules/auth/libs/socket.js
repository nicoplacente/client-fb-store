import { io } from "socket.io-client";
import { envConfig } from "@/config";

export const socket = io(envConfig.SERVER_URL);
