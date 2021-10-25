import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs"
import path from "path"
import bodyParser from "body-parser"
import listEndpoints from "express-list-endpoints";

// MIDDLEWARE ERROR HANDLERS
import {
  catchAllErrorHandler,
  entryForbiddenMiddleware,
  notFoundMiddleware,
} from "./errorHandlers.js";

// const publicFolderPath = join(getCurrentFolderPath(import.meta.url), "../public")

const server = express();
const PORT = process.env.PORT || 3000;


// server.use(express.static(publicFolderPath))
server.use(cors());
server.use(express.json());


// TELL SERVER YOU WANT TO USE THIS

server.use(notFoundMiddleware);
server.use(entryForbiddenMiddleware);
server.use(catchAllErrorHandler);

// MIDDLEWARES

console.table(listEndpoints(server));
// console.log(listEndpoints(server)) TO SHOW AS A LIST

server.listen(PORT, async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Server is running on ${PORT}  and connected to db`);
  } catch (error) {
    console.log("Db connection is failed ", error);
  }
});

server.on("error", (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
);


// FOR SERVER ALREADY IN USE ERROR RUN
// lsof -i:3000
// kill -9 [PID]
