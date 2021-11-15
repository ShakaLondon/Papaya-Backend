import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs"
import bodyParser from "body-parser"
import listEndpoints from "express-list-endpoints";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// ROUTES
import userRouter from "../src/services/users/index.js"
import reviewRouter from "../src/services/reviews/index.js"
import businessRouter from "../src/services/business/index.js"
import businessUserRouter from "../src/services/business-users/index.js"

// MIDDLEWARE ERROR HANDLERS
import {
  catchAllErrorHandler,
  entryForbiddenMiddleware,
  notFoundMiddleware,
} from "./errorHandlers.js";
import tokenRouter from "./services/token/index.js";
import imageRouter from "./services/uploads/index.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const publicDirectory = path.join(__dirname, "../public");

const server = express();

const PORT = process.env.PORT || 3005;



const whiteList = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if 
    // (whiteList.some((allowedUrl) => allowedUrl === origin)) 
    (whiteList.indexOf(origin) !== -1 || !origin)
    {
      callback(null, true);
    } else {
      const error = new Error("Not allowed by cors!");
      error.status = 403;

      callback(error);
    }
  },
};


// server.use(express.static(publicFolderPath))
server.use(cors(corsOptions));

server.use(express.json());

// server.use(express.urlencoded({ extended: true }));

server.use(express.static(publicDirectory));

server.use("/auth", tokenRouter);
server.use("/image", imageRouter);
server.use("/users", businessUserRouter);
server.use("/users", userRouter);
server.use("/reviews", reviewRouter);
server.use("/business", businessRouter);



// TELL SERVER YOU WANT TO USE THIS

server.use(notFoundMiddleware);
server.use(entryForbiddenMiddleware);
server.use(catchAllErrorHandler);

// MIDDLEWARES

console.table(listEndpoints(server));



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
