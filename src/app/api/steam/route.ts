import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 优先从环境变量读取，如果没有则尝试从 URL 参数读取（兼容性）
  const steamId = process.env.STEAM_ID || searchParams.get('steamId');
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    console.error("Steam API call failed: Missing STEAM_API_KEY in environment variables.");
    return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
  }

  if (!steamId) {
    return NextResponse.json({ error: 'Missing Steam ID. Please set STEAM_ID in Vercel env.' }, { status: 400 });
  }

  console.log(`Attempting Steam API call for steamId: ${steamId}`);

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`,
      { signal: AbortSignal.timeout(8000) } // 8秒超时保护
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Steam API 返回错误: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();

    if (!data.response || !data.response.games) {
      return NextResponse.json({ games: [] });
    }

    return NextResponse.json(data.response);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from Steam' }, { status: 500 });
  }
}