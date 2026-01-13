import { Request, Response } from "express";
import db from "../config/dbConn";
import { refreshTokens } from "../db/schema";
import { eq } from "drizzle-orm";

const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return res.status(401).json({ message: "No cookie provided" });

  const refreshToken = cookies.jwt;

  try {
    // DELETE token using Drizzle ORM
    const result = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token,refreshToken))
      .returning({ token: refreshTokens.token });

    if (result.length > 0) {
      res.status(200).json({ message: "Refresh token deleted, logged out" });
    } else {
      // nothing to delete, already removed
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });
  }
};

export default handleLogout;
