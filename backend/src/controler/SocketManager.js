
import { Server } from "socket.io";

let connection = {};
let message = {};
let timeOnline = {};

export const connectToScket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join video call
    socket.on("join_call", (path) => {
      if (!connection[path]) {
        connection[path] = [];
      }

      if (!connection[path].includes(socket.id)) {
        connection[path].push(socket.id);
      }

      timeOnline[socket.id] = new Date();

      // Notify users about the joining user
      for (const id of connection[path]) {
        io.to(id).emit("user_join", socket.id, connection[path]);
      }

      // Send previous messages to the joining user
      if (message[path]) {
        for (const item of message[path]) {
          io.to(socket.id).emit(
            "chat_message",
            item.data,
            item.sender,
            item.socket_id_sender
          );
        }
      }
    });

    // WebRTC signaling
    socket.on("signal", (toId, signalData) => {
      io.to(toId).emit("signal", socket.id, signalData);
    });

    // Chat messages
    socket.on("chat_message", (data, sender) => {
      const matchingRoom = Object.keys(connection).find((room) =>
        connection[room].includes(socket.id)
      );

      if (!matchingRoom) {
        console.log("User is not in a room");
        return;
      }

      if (!message[matchingRoom]) {
        message[matchingRoom] = [];
      }

      const chatMessage = {
        sender: sender,
        data: data,
        socket_id_sender: socket.id,
      };

      message[matchingRoom].push(chatMessage);

      console.log("Message:", sender, data);

      // Broadcast message to everyone in the same room
      for (const id of connection[matchingRoom]) {
        io.to(id).emit(
          "chat_message",
          data,
          sender,
          socket.id
        );
      }
    });

    // User disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      delete timeOnline[socket.id];

      for (const room of Object.keys(connection)) {
        const index = connection[room].indexOf(socket.id);

        if (index !== -1) {
          connection[room].splice(index, 1);

          for (const id of connection[room]) {
            io.to(id).emit("user_left", socket.id);
          }

          if (connection[room].length === 0) {
            delete connection[room];
            delete message[room];
          }

          break;
        }
      }
    });
  });

  return io;
};
