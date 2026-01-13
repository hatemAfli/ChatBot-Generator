import axios from "axios";
import { Request, Response } from "express";
import db from "../config/dbConn";
import { botConfigs } from "../db/schema";
import { eq } from "drizzle-orm";

const chatWithMe = async (req: Request, res: Response) => {
  const botId = req.params.botId;
  const message = req.body.message;

  try {
    const result = await db
      .select()
      .from(botConfigs)
      .where(eq(botConfigs.botId, Number(botId)));

    if (result.length === 0) {
      return res.status(404).json({ error: "Bot config not found" });
    }

    const botConfig = result[0];
    console.log(botConfig);
    let responsee = await axios.post(
      "http://localhost:8000/predict",
      {botConfig,message}
      
    );
    console.log(responsee.data);
    // { response: 'hi', bot_id: null, agent: null, first_domain: null }
    let response2 = responsee.data;

     

    res.json({ message: response2 });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export default chatWithMe;
