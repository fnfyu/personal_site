export interface Game {
  id: string;
  appid?: number;
  name: string;
  cover: string;
  playtime_forever?: number; // in minutes
  status: 'playing' | 'completed' | 'backlog' | 'abandoned';
  rating: number; // 0-5
  tags: string[];
  notes: string;
  platform: 'steam' | 'epic' | 'other';
  last_played?: number;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
}