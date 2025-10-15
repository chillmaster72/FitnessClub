const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Ollama Local API
const OLLAMA_API_URL = "http://localhost:11434/api/chat";

app.post("/chat", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma2:2b",   // 🔑 use Gemma 2B
        messages: [
          { role: "system", content: "You are a gym coach AI to give workout and diet plans. If anything else asked say I can only answer workout, meal plan related queries and nothing else. Answer in 7 sentence max" },
          { role: "user", content: userPrompt }
        ],
        stream: false
      })
    });

    const data = await response.json();
    console.log("Ollama response:", data);

    if (data.message?.content) {
      res.json({ reply: data.message.content });
    } else {
      res.json({ reply: "⚠️ No response from local model." });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "⚠️ Server error, please try again." });
  }
});

app.use(express.static("public"));
app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
