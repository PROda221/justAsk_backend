const http = require("http");
const express = require("express");
require("dotenv").config();
const { Server } = require("socket.io");
const cors = require("cors");

const { userRouter } = require("./Routes/users");

const { connectToMongoDb } = require("./connectiion");

const {
  initializeNotifications,
  sendNotification,
} = require("./Services/notification");

const app = express();

const PORT = process.env.PORT || 8001;
const backendName = "justAskBackend";

const server = http.createServer(app);
const io = new Server(server);

// connectToMongoDb(`${process.env.MONGO_URL}${backendName}`)
//   .then(() => console.log("mongoDb connected successfully!"))
//   .catch((err) => console.log("mongoDb connection failed :", err));

connectToMongoDb(`mongodb://127.0.0.1:27017/${backendName}`)
  .then(() => console.log("mongoDb connected successfully!"))
  .catch((err) => console.log("mongoDb connection failed :", err));

initializeNotifications();

app.use(express.json());
app.use("/users", userRouter);
app.use(cors());
app.use(express.static("ProfileImgs"));

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  next();
});

const activeConnections = new Map();
const chatPartners = new Map();
const userStatus = new Map();

function findKeysByValue(map, targetValue) {
  const keys = [];
  for (const [key, value] of map.entries()) {
    if (value === targetValue) {
      keys.push(key);
    }
  }
  return keys;
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  activeConnections.set(userId, socket);
  userStatus.set(userId, "online");

  let allChatPartners = findKeysByValue(chatPartners, userId);
  allChatPartners.forEach((partnerId) => {
    let partnerSocket = activeConnections.get(partnerId);
    let status = userStatus.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit("statusUpdate", { userId, status: status });
    }
    // chatPartners.delete(partnerId)
  });

  console.log("A user connected", socket.id, userId);
  // Store the socket connection in the map

  socket.on("join", (userData) => {
    const { userId, chatPartnerId } = userData;
    chatPartners.set(userId, chatPartnerId);
    let chatPartnerSocket = activeConnections.get(chatPartnerId);
    let userSocket = activeConnections.get(userId);
    let chatPartnerStatus = userStatus.get(chatPartnerId);
    if (chatPartnerSocket) {
      userSocket.emit("statusUpdate", {
        chatPartnerId,
        status: chatPartnerStatus,
      });
    }
  });

  socket.on("statusUpdate", (userId, status) => {
    userStatus.set(userId, status);
    let allChatPartners = findKeysByValue(chatPartners, userId);
    allChatPartners.forEach((partnerId) => {
      let partnerSocket = activeConnections.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit("statusUpdate", { userId, status: status });
      }
    });
  });

  // Remove the socket connection from the map when disconnected
  socket.on("disconnect", () => {
    const disconnectedUser = activeConnections.get(userId);
    if (disconnectedUser) {
      let allChatPartners = findKeysByValue(chatPartners, userId);
      allChatPartners.forEach((partnerId) => {
        let partnerSocket = activeConnections.get(partnerId);
        userStatus.set(userId, "offline");
        if (partnerSocket) {
          let currentUserStatus = userStatus.get(userId);
          partnerSocket.emit("statusUpdate", {
            userId,
            status: currentUserStatus,
          });
        }
        // chatPartners.delete(partnerId)
      });

      activeConnections.delete(userId);

      console.log(`User disconnected: ${socket.id}`);
    }
  });

  socket.on("chat message", (msg, senderId, receiverId, type) => {
    const receiverSocket = activeConnections.get(receiverId);
    const receiverStatus = userStatus.get(receiverId);
    if (receiverSocket) {
      if (receiverStatus === "online") {
        receiverSocket.emit("chat message", msg, type);
      } else {
        sendNotification({ receiverId, msg, type, senderId });
      }
    }
  });
});

server.listen(PORT, () => console.log("Server started on Port ", PORT));
