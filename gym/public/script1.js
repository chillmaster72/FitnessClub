function appendMessage(message, sender) {
  const chatBox = document.getElementById("chat-box");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}`;
  msgDiv.textContent = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const prompt = input.value.trim();
  if (!prompt) return;

  appendMessage(prompt, "user");
  input.value = "";

  appendMessage("Thinking...", "bot");
  const chatBox = document.getElementById("chat-box");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    chatBox.lastChild.remove(); // remove "Thinking..."
    appendMessage(data.reply, "bot");
  } catch (err) {
    console.error("Client error:", err);
    chatBox.lastChild.remove();
    appendMessage("⚠️ Failed to connect to server.", "bot");
  }
}
