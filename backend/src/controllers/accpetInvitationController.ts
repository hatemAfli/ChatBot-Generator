import { Request, Response } from "express";
import pool from "../config/dbConn";
import { emit } from "process";
import { Result } from "pg";
import crypto from "crypto";
import { bots, invitation, userBot, users } from "../db/schema";
import db from "../config/dbConn";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";

export const accpetInvitation = async (
  req: Request<{}, {}, { password: string }, { token: string }>,
  res: Response
) => {
  try {
    let token = req.query.token;
    let password = req.body.password;

    console.log("email", token, "password", password);

    if (!token || !password) {
      return res.status(400).json({ message: "invalid request" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const result = await db
      .select()
      .from(invitation)
      .where(eq(invitation.tokenHash, tokenHash));

    //check if the inviation is found
    if (result.length === 0)
      return res.status(400).json({ message: "not found token" });

    //check if it's expired or no
    let inv = result[0];
    if (Date.now() > new Date(inv.expireAt).getTime()) {
      // expired
      await db.delete(invitation).where(eq(invitation.tokenHash, tokenHash));
      return res.status(400).json({ message: "expired token" });
    }

    // the token is valid we will create the user and delete the token

    const passwordHash = await bcrypt.hash(password, 10);

    const [userRow] = await db
      .insert(users)
      .values({
        email: inv.email,
        motdepasse: passwordHash,
        role: inv.role,
        nom: inv.nom,
        prenom: inv.prenom,
        num: inv.num,
      })
      .returning();

    // Single-use: remove invitation
    await db.delete(invitation).where(eq(invitation.tokenHash, tokenHash));

     
    // link the user with their bots

      let botIds=result[0].botIds??[]

      for( let i=0 ;i< botIds.length ;i++)
      {
         await db.insert(userBot).values({userId:userRow.id,botId:botIds[i]})
      }

      res.json({ message: "user created successfully" });


 
  } catch (err) {

    if ((err as { code?: string }).code === "23505") {
      res.status(409).json({ error: "Email already exists" });
    }
    console.log(err);
    res.sendStatus(500);
  }
};
