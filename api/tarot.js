export default async function handler(req, res) {
    try {
        const { cards } = req.body;
        if (!cards || cards.length !== 3) {
            return res.status(400).json({ error: "请提供三张塔罗牌。" });
        }

        const prompt = `
你是一名专业塔罗师，请根据三张塔罗牌进行解读。
塔罗牌：${cards.join(", ")}

请严格输出以下结构：
1. 【象征意义】
2. 【情绪洞察】
3. 【灵性建议】
`;

        const apiKey = process.env.DEEPSEEK_API_KEY;

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "你是一名专业塔罗占卜师" },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        if (!data.choices) {
            return res.status(500).json({ error: "API 返回异常", detail: data });
        }

        res.status(200).json({ result: data.choices[0].message.content });

    } catch (err) {
        res.status(500).json({ error: "服务器错误", detail: err.message });
    }
}
