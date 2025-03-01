export interface TwitchUser {
  broadcaster_type: "partner" | "affiliate" | "";
  description: string;
  display_name: string;
  id: string;
  login: string;
  offline_image_url: string;
  profile_image_url: string;
  type: "staff" | "admin" | "global_mod" | "";
  view_count: number;
  created_at: string;
}

export interface TwitchColour {
  colourHex: string;
  colorRgb: string;
  isLight: boolean;
}

export interface TwitchStream {
  game_id: string;
  game_name: string;
  id: string;
  language: string;
  started_at: string;
  tag_ids: string[];
  thumbnail_url: string;
  title: string;
  type: "live" | "";
  user_id: string;
  user_login: string;
  user_name: string;
  viewer_count: number;
  profile_image_url: string;
  average_color?: TwitchColour;
}
