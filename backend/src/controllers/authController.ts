import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import db from "../config/dbConn";
import { users, refreshTokens } from "../db/schema";
import { generateAccessToken, generateRefreshToken } from "./utils";

const handleLogin = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, motdepasse } = req.body;

    // Basic input validation
    if (!email || !motdepasse) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Fetch user by email
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(motdepasse, user.motdepasse);

    // Compare password hashes
    const passwordOk = await bcrypt.compare(motdepasse, user.motdepasse);
    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // here the user is authenticated

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //saving refrshToken with current user

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, //1d
    });

    //insert refresh token of the user in the database
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("handleLogin error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handleLogin;
