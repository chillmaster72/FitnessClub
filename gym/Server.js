const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const app = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // your secret key
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


app.post("/create-checkout-session", async (req, res) => {
  const { amount, name } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name },
            unit_amount: amount, // in cents
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5500/success.html`,
      cancel_url: `http://localhost:5500/cancel.html`,
    });

    // Return the URL for the hosted checkout page
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});



app.get("/", (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, "public/index.html"), "utf8");
  // Replace a placeholder with the publishable key
  html = html.replace("{{STRIPE_PUBLISHABLE_KEY}}", process.env.STRIPE_PUBLISHABLE_KEY);
  res.send(html);
});




app.use(express.static("public"));
app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
