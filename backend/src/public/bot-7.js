

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

  container.innerHTML = `
    <div id="chatbot-header">Chatbot</div>
    <div id="chatbot-messages"></div>
    <div id="chatbot-input-area">
      <input id="chatbot-input" type="text" placeholder="Type a message..." />
      <button id="chatbot-send">Send</button>
    </div>
  `;
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
    msg.className = `message ${sender}`;
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
      const res = await fetch("https://localhost:3000/bots/7/publish", {
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
    "--color-neutral": "#F0F0F0",
    "--color-primary": "#008000",
    "--color-secondary": "#FFD700",

    "--border-radius": "large", /* 'large' → mapped to px */
    "--font-size": "grande", /* 'grande' */
    "--typing-animation": "vague", /* Just a label, JS/CSS will implement */

    "--launcher-icon": "house_icon.png",
  });
});


  