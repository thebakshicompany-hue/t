exports.handler = async (event, context) => {
  if (event.httpMethod === "GET") {
    return { statusCode: 200, body: JSON.stringify({ status: "active", provider: "Sarvam AI (Optimized)" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages, temperature } = JSON.parse(event.body);

    // Speed optimization: Ensure the system message requests a fast response
    if (messages && messages[0].role === "system") {
      messages[0].content += " Respond as quickly as possible. Keep the draft professional but avoid unnecessary verbosity to stay within timeout limits.";
    }

    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        model: "sarvam-105b",
        messages,
        temperature: temperature || 0.7,
        max_tokens: 1800 // Reduced from 4096 to fit within Netlify's 10s window
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server Error", message: error.message })
    };
  }
};
