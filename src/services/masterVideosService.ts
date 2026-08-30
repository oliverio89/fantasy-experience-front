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

export function extractYoutubeId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol !== "https:") return null;

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let id: string | null = null;

    if (hostname === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else {
        const [kind, pathId] = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(kind)) id = pathId || null;
      }
    }

    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function getYoutubeEmbedUrl(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : "";
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
        .select(
          "id,master_id,youtube_url,title,description,game_system,num_players,duration_minutes,played_at,is_featured,created_at,profiles:master_id(full_name)"
        )
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);

      return (data || []).flatMap((row) => {
        const youtubeId = extractYoutubeId(row.youtube_url);
        if (!youtubeId) return [];

        return [
          {
            id: row.id,
            masterId: row.master_id,
            masterName: row.profiles?.full_name || "Master",
            youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
            title: row.title,
            description: row.description,
            gameSystem: row.game_system,
            numPlayers: row.num_players,
            durationMinutes: row.duration_minutes,
            playedAt: row.played_at,
            isFeatured: row.is_featured,
            createdAt: row.created_at,
          },
        ];
      });
    } catch (error) {
      console.error("Error al obtener vídeos destacados:", error);
      return [];
    }
  }
}
