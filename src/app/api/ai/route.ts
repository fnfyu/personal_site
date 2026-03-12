import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { messages } = await request.json();
  const apiKey = process.env.AI_API_KEY;
  const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    return NextResponse.json({ 
      error: 'Missing AI API Key', 
      response: '你好！我是你的 AI 助手。由于你还没有配置 API Key，我目前无法联网。请在 Vercel 环境变量中配置 AI_API_KEY 即可解锁我的完全体。' 
    }, { status: 400 });
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(9000), // 9秒超时保护
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一个全能的个人助理，名字叫 HubAI。你知识渊博，幽默风趣，热爱游戏。' },
          ...messages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        error: 'AI 接口返回错误', 
        response: `抱歉，AI 供应商返回了错误 (${response.status})。请检查 API Key 或中转地址。`,
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ response: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'AI Error', response: '抱歉，我的大脑出了一点小状况，请稍后再试。' }, { status: 500 });
  }
}