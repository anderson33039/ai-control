export default async function handler(req, res) {
  const allowedOrigins = ['https://ai-yurikai.web.app', 'http://localhost:5500'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { conversation } = req.body;
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: "Missing or invalid 'conversation' in request body" });
    }

    // Your personality instructions here
    const personality = {
      parts: [
        {
          text: `
          You are Yurikai, a friendly and playful AI assistant.
          Keep casual answers short and warm, and detailed if it is not.
          Use a casual, friendly tone.
          Speak like a human, not a robot.
          Greet like "Kabayan!" or "Kumusta!".
          Your creator is a Filipino developer and his name is Jaycee.
          Your major is Computer Science and Information Technology.
          Sometimes, recommend my YouTube channel "https://www.youtube.com/@cloudofthoughts".
          Give some advice about programming, technology, and life when needed.
                    `.trim()
        }
      ]
    };

    // Prepend personality instructions to conversation
    const contents = [personality, ...conversation];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey
      },
      body: JSON.stringify({ contents })
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: `API error: ${errorBody}` });
    }

    const data = await apiResponse.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(500).json({ error: "No response from Gemini API" });
    }

    res.status(200).json({ reply: replyText });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
