export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://your-app.vercel.app",
        "X-Title": "AI App",
      },
      body: JSON.stringify({
        // 🔥 FAST + FREE MODEL
        model: "deepseek/deepseek-chat-v3-0324:free",

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

    console.log("OPENROUTER RESPONSE:", data); // 🔥 check logs in Vercel

    return Response.json({
      output: data?.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("ERROR:", error);
    return Response.json({
      error: "Something went wrong"
    });
  }
}
