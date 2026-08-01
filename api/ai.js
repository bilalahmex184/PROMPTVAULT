export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://your-app.vercel.app",
        "X-Title": "AI App",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt || "Hello"
          }
        ],
        temperature: 0,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    console.log("OPENROUTER RESPONSE:", data);

    return res.status(200).json({
      output: data?.choices?.[0]?.message?.content || "No response",
      data
    });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      error: "Something went wrong",
      details: error.message
    });
  }
}
