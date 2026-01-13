import pool from "../config/dbConn";

import path from "path";
import fs from "fs-extra";
import { Request, Response } from "express";
import db from "../config/dbConn";
import { botConfigs } from "../db/schema";
import { eq } from "drizzle-orm";

// Recreate __dirname in ES modules

export const publish = async (req: Request, res: Response) => {
  const botId = Number(req.params.id); // convert param to number
  console.log(botId);

  try {
    // 🔎 SELECT with Drizzle
    const result = await db
      .select()
      .from(botConfigs)
      .where(eq(botConfigs.botId, botId));

    if (result.length === 0) {
      return res.status(404).json({ error: "Bot config not found" });
    }

    const outputDir = path.join(__dirname, "..", "public");
    // await fs.ensureDir(outputDir); // uncomment if needed

    const designConf = result[0].designeJson;
    console.log(designConf);

    await fs.writeFile(
      path.join(outputDir, `bot-${botId}.js`),
      generateJs(botId, designConf)
    );

    // Send HTML snippet with script & CSS
    return res.send(`
      <script src="http://localhost:3000/static/bot-${botId}.js"></script>
      <link rel="stylesheet" href="http://localhost:3000/static/test/style1.css" />
    `);
  } catch (err) {
    console.error("Error in publish:", err);
    return res.status(500).send("Internal Server Error");
  }
  
};

function generateJs(botId: number, designConf: any) {
  return `

   document.addEventListener("DOMContentLoaded", function () {
  console.log("hello from iief");
  const launcher = document.createElement("div");
  launcher.id = "chatbot-launcher";
  console.log(document.body);
  document.body.appendChild(launcher);

  // Create chatbot container (hidden initially)
  const container = document.createElement("div");
  container.id = "chatbot-container";
  container.style.display = "none";

  container.innerHTML = \`
    <div id="chatbot-header">Chatbot</div>
    <div id="chatbot-messages"></div>
    <div id="chatbot-input-area">
      <input id="chatbot-input" type="text" placeholder="Type a message..." />
      <button id="chatbot-send">Send</button>
    </div>
  \`;
  document.body.appendChild(container);

  // Toggle open/close

  launcher.addEventListener("click", () => {
    container.style.display =
      container.style.display === "none" ? "flex" : "none";
  });

  // Sending a message
  const messagesDiv = container.querySelector("#chatbot-messages");
  const input = container.querySelector("#chatbot-input");
  const sendBtn = container.querySelector("#chatbot-send");

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = \`message \${sender}\`;
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";

    // Show typing animation
    const typing = document.createElement("div");
    typing.className = "message bot";
    typing.innerHTML =
      '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      // Replace with your backend API URL
      const res = await fetch("http://localhost:3000/chat/${botId}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      // Remove typing animation
      messagesDiv.removeChild(typing);

      addMessage(data.message || "No reply", "bot");
    } catch (err) {
      messagesDiv.removeChild(typing);
      addMessage("Error connecting to server", "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function setTheme(clientTheme) {
    Object.entries(clientTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  setTheme({
    /* From designe_json */
    "--color-neutral": "${designConf.couleurs.neutre}",
    "--color-primary": "${designConf.couleurs.primaire}",
    "--color-secondary": "${designConf.couleurs.secondaire}",

    "--border-radius": "${designConf.border_radius}", /* 'large' → mapped to px */
    "--font-size": "${designConf.taille_police}", /* 'grande' */
    "--typing-animation": "${designConf.animation_taper}", /* Just a label, JS/CSS will implement */

    "--launcher-icon": "${designConf.icone_lanceur}",
  });
});


  `;
}
