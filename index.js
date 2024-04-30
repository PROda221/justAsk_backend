const http = require("http")
const express = require("express");
require('dotenv').config();
const {Server} = require("socket.io")
const cors = require('cors');

const {userRouter} = require("./Routes/users");

const { connectToMongoDb } = require("./connectiion");

const app = express();

const PORT = 8001;
const backendName = "justAskBackend";

const server = http.createServer(app)
const io = new Server(server);

connectToMongoDb(`mongodb://127.0.0.1:27017/${backendName}`)
  .then(() => console.log("mongoDb connected successfully!"))
  .catch((err) => console.log("mongoDb connection failed :", err));

app.use(express.json());
app.use("/users", userRouter);
app.use(cors());

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  next();
});

const activeConnections = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  console.log('A user connected', socket.id);
    // Store the socket connection in the map
    activeConnections.set(userId, socket);


  socket.on('chat message', (msg, receiverId) => {
    console.log('Message received:', msg, 'Receiver ID:', receiverId);
    const receiverSocket = activeConnections.get(receiverId);
    if (receiverSocket) {
      receiverSocket.emit('chat message', msg);
    } else {
      console.log('Receiver is not connected');
    }
  });

  // Remove the socket connection from the map when disconnected
  socket.on('disconnect', () => {
    console.log('User disconnected');
    activeConnections.delete(userId);
  });
});

server.listen(PORT, () => console.log("Server started on Port ", PORT));
