import { Server } from "socket.io";

export async function GET(req) {
  if (!global.io) {
    console.log("Initializing Socket.IO...");

    const io = new Server(global.server, {
      path: "/api/socket/io",
    });

    global.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }

  return new Response("Socket is running");
}