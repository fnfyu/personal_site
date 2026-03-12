import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appid = searchParams.get('appid');
  const steamIdsStr = process.env.STEAM_ID;
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey || !appid || !steamIdsStr) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const steamIds = steamIdsStr.split(',').map(id => id.trim());
  const allScreenshots: string[] = [];

  try {
    for (const steamId of steamIds) {
      // type=4 means screenshots
      const response = await fetch(
        `https://api.steampowered.com/IPublishedFileService/GetUserFiles/v1/?key=${apiKey}&steamid=${steamId}&appid=${appid}&numperpage=10&page=1&type=4`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.response && data.response.publishedfiledetails) {
          const urls = data.response.publishedfiledetails
            .filter((file: any) => file.preview_url)
            .map((file: any) => file.preview_url);
          allScreenshots.push(...urls);
        }
      }
    }

    // 去重并返回最近的 20 张截图
    const uniqueScreenshots = Array.from(new Set(allScreenshots)).slice(0, 20);
    return NextResponse.json({ screenshots: uniqueScreenshots });
  } catch (error) {
    console.error('Fetch Steam screenshots error:', error);
    return NextResponse.json({ error: 'Steam API Error' }, { status: 500 });
  }
}