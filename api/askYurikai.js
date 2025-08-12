export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

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
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      })
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      return res.status(apiResponse.status).json({ error: `API error: ${errorBody}` });
    }

    const data = await apiResponse.json();

    // Navigate the response to get the generated text
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(500).json({ error: "No response from Gemini API" });
    }

    res.status(200).json({ reply: replyText });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
