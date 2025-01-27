const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const connectedUsers = {};

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    connectedUsers[socket.id] = username;
    io.emit("user-joined", username);
  });

  socket.on("message", ({ username, message }) => {
    // Envia a mensagem para todos os outros clientes, exceto o remetente
    socket.broadcast.emit("message", { username, message });
  });  

  socket.on("disconnect", () => {
    const username = connectedUsers[socket.id];
    if (username) {
      io.emit("message", { username: "System", message: `${username} saiu do chat.` });
      delete connectedUsers[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
