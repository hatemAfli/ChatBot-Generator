import { Request, Response } from "express";
import { eq, asc } from "drizzle-orm";

import db from "../config/dbConn"; // Drizzle instance
import { botConfigs, bots, userBot, users } from "../db/schema"; // Adjust to actual exported tables
import { publish } from "./publishBotController";
import { Result } from "pg";

export { publish };

interface createBotBody {
  name: string;
  status: "active" | "desactive";
  owner_id: number;
}

// 📌 Create a bot
export const createBot = async (
  req: Request<{}, {}, createBotBody>,
  res: Response
) => {
  const { name, status, owner_id } = req.body;
  try {
    const [row] = await db
      .insert(bots)
      .values({
        name,
        status,
        ownerId: owner_id,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    console.error("Error creating bot:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// get bots of a user and thier configuration
export const getBotsOfUser = async (req: Request, res: Response) => {
  try {
    let userId = Number(req.params.id);
    let result = await db
      .select({
        userid: userBot.userId,
        botId: userBot.botId,
        name: bots.name,
        botConfigs: botConfigs,
      })
      .from(userBot)
      .leftJoin(bots, eq(userBot.botId, bots.idBot))
      .leftJoin(botConfigs, eq(bots.idBot, botConfigs.botId))
      .where(eq(userBot.userId, userId));

    console.log(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "server error" });
  }
};


// 📌 Get all bots
export const getAllBots = async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(bots).orderBy(asc(bots.idBot)); // adjust column name if different (e.g. bots.id)
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching bots:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 📌 Get a bot by ID
export const getBotById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const result = await db.select().from(bots).where(eq(bots.idBot, id));
    if (result.length === 0) {
      return res.status(404).json({ error: "Bot not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Error fetching bot:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Update a bot
export const updateBot = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, status } = req.body;
  try {
    const rows = await db
      .update(bots)
      .set({ name, status })
      .where(eq(bots.idBot, id))
      .returning();

    if (rows.length === 0) {
      return res.status(404).json({ error: "Bot not found" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error updating bot:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Delete a bot
export const deleteBot = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    const rows = await db
      .delete(bots)
      .where(eq(bots.idBot, id))
      .returning({ id: bots.idBot });

    if (rows.length === 0) {
      return res.status(404).json({ error: "Bot not found" });
    }
    return res
      .status(200)
      .json({ message: "Bot deleted successfully", id: rows[0].id });
  } catch (err) {
    console.error("Error deleting bot:", err);
    res.status(500).json({ error: "Server error" });
  }
};
