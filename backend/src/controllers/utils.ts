import jwt from "jsonwebtoken";
import { users } from "../db/schema";
import { InferSelectModel } from "drizzle-orm";


type userRow=InferSelectModel<typeof users>

export function generateAccessToken(user:userRow):string  {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15min",
    }
  );
}

export function generateRefreshToken(user:userRow) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
}
