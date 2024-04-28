const express = require("express");
require('dotenv').config();

const {userRouter} = require("./Routes/users");

const { connectToMongoDb } = require("./connectiion");

const app = express();

const PORT = 8001;
const backendName = "justAskBackend";

connectToMongoDb(`mongodb://127.0.0.1:27017/${backendName}`)
  .then(() => console.log("mongoDb connected successfully!"))
  .catch((err) => console.log("mongoDb connection failed :", err));

app.use(express.json());
app.use("/users", userRouter);

app.listen(PORT, () => console.log("Server started on Port ", PORT));
