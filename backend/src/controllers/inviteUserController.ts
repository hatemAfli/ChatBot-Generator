import { Request, Response } from "express";
import pool from "../config/dbConn";
import nodemailer from "nodemailer";
import db from "../config/dbConn";

import { invitation, users } from "../db/schema";
 import { sql } from "drizzle-orm";
import crypto from "crypto";

let generateToken = (): { raw: string; hash: string } => {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
};

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, num, role, botIds } = req.body;
    console.log(req.body);

    const { raw, hash } = generateToken();

    let result = await db
      .insert(invitation)
      .values({
        tokenHash: hash,
        email,
        role,
        botIds,
        num,
        nom,
        prenom,
        expireAt: sql`NOW() + INTERVAL '3 days' `,
      })
      .returning();

    let inviteLink = `http://localhost:5173/?token=${raw}`;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mouhebboubaker2@gmail.com",
        pass: "yqqq tjem clxf lniz",
      },
    });

    await transporter.sendMail({
      from: "mouhebboubaker2@gmail.com",
      to: email,
      subject: "Your account invitation",
      text: `Click to activate: ${inviteLink}\nThis link expires in 3 days.`,
    });

    res.status(201).json({ message: "invtation sent" });
  } catch (err) {
    console.error("Error creating bot:", err);
    res.status(500);
  }
};
