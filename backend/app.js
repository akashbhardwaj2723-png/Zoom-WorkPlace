import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import mongoose from "mongoose";
import cors from "cors";

import dns from "node:dns";
import { connectToScket } from "./src/controler/SocketManager.js";

import userRoutes from "./src/routes/users.route.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();
const server = createServer(app);

const io = connectToScket(server);

app.use(cors());

app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))

app.use("/api/v1/users", userRoutes)

let port = process.env.PORT || 8080;
let url = process.env.MONGO_URL;




const start = async()=>{


server.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
});
  const connectDb = await mongoose.connect(url);
  console.log("DB Connected!!");
  
}
start();
