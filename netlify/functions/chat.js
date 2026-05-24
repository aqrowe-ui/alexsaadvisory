const Anthropic = require("@anthropic-ai/sdk");

// Secure AI chat proxy for ALEXSA Advisory
// Your API key lives in Netlify environment variables — never in this file.
// Set ANTHROPIC_API_KEY in Netlify dashboard → Site settings → Environment variables

exports.handler = async function (event) {

  // Only allow POST requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  // Basic body validation
  let system, messages;
  try {
    const body = JSON.parse(event.body);
    system   = body.system;
    messages = body.messages;
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" })
    };
  }

  // Call Anthropic — API key read from server environment, never exposed
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: system,
      messages: messages
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(response)
    };

  } catch (err) {
    console.error("Anthropic API error:", err.message);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "AI service temporarily unavailable. Please email alexsa@alexsaadvisory.com for assistance."
      })
    };
  }
};
