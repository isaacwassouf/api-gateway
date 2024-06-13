import * as dotenv from "dotenv";

dotenv.config();

import express, {Express, Request, Response} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import the router from Google.ts
import {router} from "./routes/auth/google";

import {UserManagementClient} from "./services/users";

const server: Express = express();

// use the cookie parser middleware
server.use(cookieParser());
// use the cors middleware
server.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true,
}));
// use the router
server.use("/api/auth/google", router);

server.get("/", (req: Request, res: Response) => {
    // log the cookies
    console.log(req.cookies);
    // send the cookies
    res.json(req.cookies);
});

server.listen(5173, () => {
    console.log("Server is running on http://localhost:5173");

    // initialize the user management client
    UserManagementClient.getInstance();
    console.log("User Management Client initialized");
});
