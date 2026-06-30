import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types/socket";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("🟢 [Socket.io] Client connected:", socket.id);

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        console.log(`[Socket.io] User joined room: ${roomId}`);
      });

      socket.on("send-message", (message) => {
        console.log(`[Socket.io] New message in room ${message.roomId}`);
        // Broadcast para todos na sala
        io.to(message.roomId).emit("receive-message", message);
      });

      socket.on("disconnect", () => {
        console.log("🔴 [Socket.io] Client disconnected:", socket.id);
      });
    });
  }
  res.end();
};

export default ioHandler;
