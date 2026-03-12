import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 支持逗号分隔的多个 Steam ID: 7656...,7656...
  const steamIdsStr = process.env.STEAM_ID || searchParams.get('steamId');
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
  }

  if (!steamIdsStr) {
    return NextResponse.json({ error: 'Missing Steam ID' }, { status: 400 });
  }

  const steamIds = steamIdsStr.split(',').map(id => id.trim());
  
  try {
    const allGames: any[] = [];
    
    for (const steamId of steamIds) {
      const response = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.response && data.response.games) {
          allGames.push(...data.response.games);
        }
      }
    }

    // 根据 appid 去重（防止多个账号有同一个游戏）
    const uniqueGames = Array.from(new Map(allGames.map(game => [game.appid, game])).values());

    return NextResponse.json({ games: uniqueGames });
  } catch (error) {
    return NextResponse.json({ error: 'Steam API Error' }, { status: 500 });
  }
}