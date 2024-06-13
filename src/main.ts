import express, { Express, Request, Response } from "express";

// import the router from Google.ts
import { router } from "./routes/auth/google";

const server: Express = express();

// use the router
server.use("/api/auth/google", router);

server.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

server.listen(5173, () => {
  console.log("Server is running on http://localhost:5173");
});
