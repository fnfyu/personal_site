import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get('steamId');
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey || !steamId) {
    return NextResponse.json({ error: 'Missing API Key or Steam ID' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`
    );
    const data = await response.json();

    if (!data.response || !data.response.games) {
      return NextResponse.json({ games: [] });
    }

    return NextResponse.json(data.response);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from Steam' }, { status: 500 });
  }
}