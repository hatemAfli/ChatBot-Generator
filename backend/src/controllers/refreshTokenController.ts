import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import db from "../config/dbConn"; // your drizzle instance
import { users, refreshTokens } from "../db/schema"; // schema.ts tables
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "./utils";

const handleRefreshToken = async (req: Request, res: Response) => {
  //check if the user has a refresh token
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).send("without cookie"); //unauthorized
  const refreshToken = cookies.jwt;

  //  look up the user by refresh token
  const foundUser = await db
    .select()
    .from(users)
    .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
    .where(eq(refreshTokens.token, refreshToken));

  console.log("user of the refresh token", foundUser[0]?.users);
  console.log("refresh token", refreshToken);

  // ✅ if no refresh Token found → token reuse or invalid
  if (foundUser.length === 0) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          console.log("invalid refresh token");
          return res.status(403).json({ error: "invalid refresh token" });
        }

        // ✅ detected reuse of refresh token
        console.log("attempt to reuse a refresh token ");
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.userId, decoded.id));

        console.log("the payload ", decoded);
        return res.status(403).send("reused refresh token");
      }
    );
  } else {
    // ✅ validate refresh token so we can rotate it
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          // expired refresh token (not invalid since it exists in DB)
          console.log("expired refresh token");
          await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.token, refreshToken));
          return res.status(403).send("expired refresh token");
        }

        // ✅ valid refresh token → rotate it
        console.log("decoded refresh token", decoded);
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.token, refreshToken));

        const newRefreshToken = generateRefreshToken(foundUser[0].users);

        // save the new refresh token in the database
        // ✅ save the new refresh token in DB
        await db.insert(refreshTokens).values({
          userId: foundUser[0].users.id,
          token: newRefreshToken,
        });

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        const accessToken = generateAccessToken(foundUser[0].users);
        res.json({ accessToken });
      }
    );
  }
};

export default handleRefreshToken;
