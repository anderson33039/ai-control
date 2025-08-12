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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { contents } = req.body;
    if (!contents) {
      return res.status(400).json({ error: "Missing 'contents' in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    res.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
