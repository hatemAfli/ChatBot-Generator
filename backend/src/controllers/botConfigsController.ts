import pool from "../config/dbConn"; // shared pg pool
import { Request, Response } from "express";
import { botConfigs } from "../db/schema";
import db from "../config/dbConn";
import { eq } from "drizzle-orm";

// 📌 CREATE a bot config
export const createBotConfig = async (req: Request, res: Response) => {
  const {
    general_json,
    designe_json,
    behavior_json,
    sources_json,
    from_json,
    bot_id,
  } = req.body;

  console.log("req.body", req.body);
  console.log("req.body.designe_json", req.body.designe_json);

  try {
    const result = await db
      .insert(botConfigs)
      .values({
        generalJson: general_json,
        designeJson: designe_json,
        behaviorJson: behavior_json,
        sourcesJson: sources_json,
        fromJson: from_json,
        botId: bot_id,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Error creating bot config:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 READ all bot configs
export const getAllBotConfigs = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(botConfigs)
      .orderBy(botConfigs.cnfigId);
    res.json(result);
  } catch (err) {
    console.error("Error fetching bot configs:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 READ one bot config by ID
export const getBotConfigByBotId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await db
      .select()
      .from(botConfigs)
      .where(eq(botConfigs.botId, Number(id)));

    if (result.length === 0) {
      return res.status(404).json({ error: "Bot config not found" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Error fetching bot config:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 UPDATE a bot config
export const updateBotConfig = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { general_json, designe_json, behavior_json, sources_json, from_json } =
    req.body;

  try {
    const result = await db
      .update(botConfigs)
      .set({
        generalJson: general_json,
        designeJson: designe_json,
        behaviorJson: behavior_json,
        sourcesJson: sources_json,
        fromJson: from_json,
      })
      .where(eq(botConfigs.cnfigId, Number(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Bot config not found" });
    }

    res.json(result[0]);
  } catch (err) {
    console.error("Error updating bot config:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//  DELETE a bot config
export const deleteBotConfig = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await db
      .delete(botConfigs)
      .where(eq(botConfigs.cnfigId, Number(id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Bot config not found" });
    }

    res.json({ message: "Bot config deleted successfully" });
  } catch (err) {
    console.error("Error deleting bot config:", err);
    res.status(500).json({ error: "Server error" });
  }
  
};
