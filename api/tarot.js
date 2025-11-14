export default async function handler(req, res) {
  try {
    const { cards } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Missing tarot cards" });
    }

    // 调用 DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `根据这三张塔罗牌为用户进行占卜：${cards.join(", ")}
请以以下结构输出：

①【象征意义】
②【情绪洞察】
③【灵性建议】

要求温柔、具体、有情绪价值。`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({ error: "DeepSeek API Error", raw: data });
    }

    res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ error: "Server Error", detail: error.message });
  }
}
