import http from 'http';
import next from 'next';
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  // initialize socket.io with this server
  const io = new Server(server, {
    path: "/api/socket/io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("[SOCKET] Connected:", socket.id);

    socket.on("join", (userId) => {
      const roomName = String(userId);
      socket.join(roomName);
      console.log("[SOCKET] User", roomName, "joined room. Rooms:", Array.from(socket.rooms));
    });

    socket.on("disconnect", (reason) => {
      console.log("[SOCKET] Disconnected:", socket.id, "reason:", reason);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error preparing Next app:', err);
});