export default async function handler(req, res) {
  const allowedOrigins = ['https://ai-yurikai.web.app', 'http://localhost:5500'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Optionally, block or don't set header for unrecognized origins
    // return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Respond immediately to OPTIONS preflight with status 204 No Content
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: message }] }] }),
    });

    const data = await response.json();

    res.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
