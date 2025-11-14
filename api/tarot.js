// api/deepseek.js - Vercel Serverless
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

    const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_KEY) return res.status(500).json({ error: 'Missing DEEPSEEK_API_KEY in environment' });

    // 调用 DeepSeek（示例 endpoint，请按 DeepSeek 文档确认）
    const response = await fetch('https://api.deepseek.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'DeepSeek API error', detail: text });
    }

    const data = await response.json();
    // data 结构依 DeepSeek 返回而定，尽量返回可读字段
    // 假设 deepseek 返回 { text: "..." } 或 { result: "..." }
    const result = data.text || data.result || data.choices?.[0]?.text || data.choices?.[0]?.message?.content || JSON.stringify(data);
    return res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
