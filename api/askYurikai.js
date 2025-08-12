export default async function handler(req, res) {
  // Allow requests from your frontend origin (for dev: localhost)
  res.setHeader('Access-Control-Allow-Origin', 'ai-yurikai.web.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Respond OK to OPTIONS preflight requests
    return res.status(200).end();
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
    const response = await fetch("https://ai-control-five.vercel.app/api/askYurikai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ query: message })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.reply || data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
