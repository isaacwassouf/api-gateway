import express from "express";
import { Request, Response } from "express";
import {
  TokenResponse,
  exchangeCodeWithTokens,
  verifyIDToken,
} from "../../utils/auth";
import { JwtPayload } from "jsonwebtoken";

// Create a new router
export const router = express.Router();

router.get("/callback", async (req: Request, res: Response) => {
  // get the code from the request query
  const code = req.query.code;

  // exchange the code for the access and ID tokens
  const tokenResponse: TokenResponse = await exchangeCodeWithTokens(
    code as string,
  );

  // verify the ID token
  const payload: JwtPayload = await verifyIDToken(tokenResponse.id_token);
  console.log(payload);

  // send the response
  res.json({ name: "isaac" });
});
