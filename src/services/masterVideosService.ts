import { supabase } from "../lib/supabase";

export interface MasterVideo {
  id: string;
  masterId: string;
  masterName: string;
  youtubeUrl: string;
  title: string;
  description: string | null;
  gameSystem: string | null;
  numPlayers: number | null;
  durationMinutes: number | null;
  playedAt: string | null;
  isFeatured: boolean;
  createdAt: string;
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYoutubeEmbedUrl(url: string): string {
  const id = extractYoutubeId(url);
  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
    : url;
}

/** Devuelve la URL del thumbnail en máxima resolución disponible */
export function getYoutubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  if (!id) return "";
  // maxresdefault puede no existir en vídeos antiguos → hqdefault como fallback
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export class MasterVideosService {
  static async getVideosDestacados(limit = 3): Promise<MasterVideo[]> {
    try {
      const { data, error } = await supabase
        .from("master_videos")
        .select("*, profiles:master_id(full_name)")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);

      return (data || []).map((row) => ({
        id: row.id,
        masterId: row.master_id,
        masterName: row.profiles?.full_name || "Master",
        youtubeUrl: row.youtube_url,
        title: row.title,
        description: row.description,
        gameSystem: row.game_system,
        numPlayers: row.num_players,
        durationMinutes: row.duration_minutes,
        playedAt: row.played_at,
        isFeatured: row.is_featured,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error al obtener vídeos destacados:", error);
      return [];
    }
  }
}
