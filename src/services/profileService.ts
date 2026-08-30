import { supabase } from "../lib/supabase";
import { Database } from "../lib/database.types";
import { FALLBACK_AVATAR_URL } from "../constants";
import { Master } from "../types/masters";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PublicProfileRow = Omit<
  ProfileRow,
  "terms_accepted_at" | "terms_version" | "first_name" | "last_name"
>;
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type MasterStatsRow = Database["public"]["Functions"]["get_master_public_stats"]["Returns"][number];
const PUBLIC_PROFILE_COLUMNS =
  "id,full_name,avatar_url,bio,city,role,sistemas,tipos_partida,estilos,idiomas,tags,duracion_sesion,numero_jugadores,experiencia,disponibilidad,precio_por_sesion,timezone,rating,total_reviews,created_at,updated_at" as const;

const normalizeProfileList = (values: string[], fieldName: string): string[] => {
  const normalized = Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
  if (normalized.length > 20) {
    throw new Error(`${fieldName} admite un máximo de 20 valores`);
  }
  if (normalized.some((value) => value.length > 80)) {
    throw new Error(`Cada valor de ${fieldName} admite hasta 80 caracteres`);
  }
  return normalized;
};

export interface Profile {
  id: string;
  role: "admin" | "master" | "player";
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  bio?: string;
  city?: string;
  // Arrays de preferencias
  sistemas: string[];
  tiposPartida: string[];
  tags: string[];
  estilos: string[];
  duracionSesion: string[];
  numeroJugadores: string[];
  idiomas: string[];
  // Campos de master
  experiencia?: ProfileRow["experiencia"];
  disponibilidad?: ProfileRow["disponibilidad"];
  precioPorSesion?: ProfileRow["precio_por_sesion"];
  timezone?: string | null;
  // Métricas
  rating?: number;
  totalReviews?: number;
  publishedSessions?: number;
  completedSessions?: number;
  cancelledSessions?: number;
  playersServed?: number;
  digitalProducts?: number;
  digitalSales?: number;
  rankingScore?: number;
  isFeatured?: boolean;
  // Computed
  totalPartidas?: number;
  updatedAt: string;
}

export class ProfileService {
  /**
   * Mapea row de DB a objeto Profile
   */
  private static mapProfileFromDB(row: PublicProfileRow): Profile {
    return {
      id: row.id,
      role: row.role || "player",
      firstName: "",
      lastName: "",
      fullName: row.full_name || "Usuario",
      avatarUrl: row.avatar_url,
      bio: row.bio ?? undefined,
      city: row.city ?? undefined,
      sistemas: row.sistemas || [],
      tiposPartida: row.tipos_partida || [],
      tags: row.tags || [],
      estilos: row.estilos || [],
      duracionSesion: row.duracion_sesion || [],
      numeroJugadores: row.numero_jugadores || [],
      idiomas: row.idiomas || [],
      experiencia: row.experiencia ?? null,
      disponibilidad: row.disponibilidad ?? null,
      precioPorSesion: row.precio_por_sesion ?? null,
      timezone: row.timezone ?? null,
      rating: row.rating ?? 0,
      totalReviews: row.total_reviews ?? 0,
      updatedAt: row.updated_at,
    };
  }

  private static withMasterStats(
    profile: Profile,
    stats?: MasterStatsRow
  ): Profile {
    return {
      ...profile,
      rating: stats?.average_rating ?? profile.rating ?? 0,
      totalReviews: stats?.review_count ?? profile.totalReviews ?? 0,
      publishedSessions: stats?.published_sessions ?? 0,
      completedSessions: stats?.completed_sessions ?? 0,
      cancelledSessions: stats?.cancelled_sessions ?? 0,
      playersServed: stats?.players_served ?? 0,
      digitalProducts: stats?.digital_products ?? 0,
      digitalSales: stats?.digital_sales ?? 0,
      rankingScore: stats?.ranking_score ?? 0,
      isFeatured: stats?.is_featured ?? false,
    };
  }

  private static async getMasterStats(): Promise<MasterStatsRow[]> {
    const { data, error } = await supabase.rpc("get_master_public_stats");
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(PUBLIC_PROFILE_COLUMNS)
        .eq("id", userId)
        .single();

      if (error) {
        // Si no existe perfil, retornamos null
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }

      const profile = this.mapProfileFromDB(data);
      if (profile.role !== "master") return profile;

      const stats = await this.getMasterStats();
      return this.withMasterStats(
        profile,
        stats.find((item) => item.master_id === userId)
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  /**
   * Obtiene lista de "Masters" con datos agregados de sus partidas.
   * Ahora hace un fetch de los juegos para calcular dinámicamente:
   * - Sistemas que dirige (tags)
   * - Tipos de partida (Online, Presencial, etc)
   */
  static async getMasters(): Promise<Profile[]> {
    try {
      // Los Másters deben aparecer aunque todavía no hayan publicado una partida.
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(PUBLIC_PROFILE_COLUMNS)
        .eq("role", "master");

      if (profilesError) throw profilesError;
      if (!profilesData || profilesData.length === 0) return [];

      const masterIds = profilesData.map((profile) => profile.id);
      const [gamesResult, stats] = await Promise.all([
        supabase
          .from("games")
          .select("master_id, game_system, game_type")
          .in("master_id", masterIds)
          .in("status", ["active", "full"]),
        this.getMasterStats(),
      ]);

      if (gamesResult.error) throw gamesResult.error;
      const activeGames = gamesResult.data || [];

      const profiles = profilesData.map((p) => {
        const profile = this.withMasterStats(
          this.mapProfileFromDB(p),
          stats.find((item) => item.master_id === p.id)
        );

        // Filtrar partidas de este master
        const masterGames = activeGames.filter((g) => g.master_id === p.id);

        // Agregar Sistemas únicos de sus partidas
        // Si ya tiene sistemas en el perfil, los combinamos (o priorizamos los de las partidas si quisieramos)
        // Aquí vamos a combinar: lo que puso en su perfil + lo que realmente dirige
        const gameSystems = masterGames
          .map((g) => g.game_system)
          .filter(Boolean);
        const combinedSystems = Array.from(
          new Set([...profile.sistemas, ...gameSystems])
        );

        // Agregar Tipos únicos (Online, Digital...)
        const gameTypes = masterGames.map((g) => g.game_type).filter(Boolean);
        const combinedTypes = Array.from(
          new Set([...profile.tiposPartida, ...gameTypes])
        );

        return {
          ...profile,
          sistemas: combinedSystems,
          tiposPartida: combinedTypes,
          // Podríamos calcular también el número de partidas
          totalPartidas: masterGames.length,
        };
      });

      return profiles;
    } catch (error) {
      console.error("Error fetching masters:", error);
      throw error instanceof Error
        ? error
        : new Error("No se pudo cargar el catálogo de Másters");
    }
  }

  /**
   * Actualiza el perfil completo
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<void> {
    try {
      // Mapear camelCase a snake_case para la DB
      const dbUpdates: ProfileUpdate = {
        updated_at: new Date().toISOString(),
      };

      if (updates.fullName !== undefined) {
        const fullName = updates.fullName.trim();
        if (fullName.length < 2 || fullName.length > 80) {
          throw new Error("El nombre público debe tener entre 2 y 80 caracteres");
        }
        dbUpdates.full_name = fullName;
      }
      if (updates.avatarUrl !== undefined)
        dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.bio !== undefined) {
        if (updates.bio.length > 2000) throw new Error("La biografía es demasiado larga");
        dbUpdates.bio = updates.bio.trim();
      }
      if (updates.city !== undefined) {
        const city = updates.city.trim();
        if (city.length > 100) throw new Error("La ciudad es demasiado larga");
        dbUpdates.city = city || null;
      }
      if (updates.sistemas !== undefined)
        dbUpdates.sistemas = normalizeProfileList(updates.sistemas, "Sistemas");
      if (updates.tiposPartida !== undefined)
        dbUpdates.tipos_partida = normalizeProfileList(
          updates.tiposPartida,
          "Tipos de partida"
        );
      if (updates.tags !== undefined)
        dbUpdates.tags = normalizeProfileList(updates.tags, "Etiquetas");
      if (updates.estilos !== undefined)
        dbUpdates.estilos = normalizeProfileList(updates.estilos, "Estilos");
      if (updates.duracionSesion !== undefined)
        dbUpdates.duracion_sesion = normalizeProfileList(
          updates.duracionSesion,
          "Duración de sesión"
        );
      if (updates.numeroJugadores !== undefined)
        dbUpdates.numero_jugadores = normalizeProfileList(
          updates.numeroJugadores,
          "Número de jugadores"
        );
      if (updates.idiomas !== undefined)
        dbUpdates.idiomas = normalizeProfileList(updates.idiomas, "Idiomas");
      if (updates.experiencia !== undefined)
        dbUpdates.experiencia = updates.experiencia;
      if (updates.disponibilidad !== undefined)
        dbUpdates.disponibilidad = updates.disponibilidad;
      if (updates.precioPorSesion !== undefined)
        dbUpdates.precio_por_sesion = updates.precioPorSesion;
      if (updates.timezone !== undefined) {
        const timezone = updates.timezone?.trim() || null;
        if (timezone && timezone.length > 64) {
          throw new Error("La zona horaria es demasiado larga");
        }
        dbUpdates.timezone = timezone;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId)
        .select("id")
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No tienes permiso para actualizar este perfil");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Sube un avatar al bucket 'avatars'
   * Retorna la URL pública
   */
  static async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen");
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("La imagen no puede superar los 2MB");
      }

      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const fileExt = extensions[file.type];
      if (!fileExt) throw new Error("Formato de imagen no permitido");

      const { data: previousFiles, error: listError } = await supabase.storage
        .from("avatars")
        .list(userId, { limit: 100 });
      if (listError) throw new Error(listError.message);
      const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("id")
        .maybeSingle();
      if (profileError || !updatedProfile) {
        const { error: rollbackError } = await supabase.storage
          .from("avatars")
          .remove([fileName]);
        if (rollbackError) {
          console.warn("No se pudo retirar el avatar tras el error:", rollbackError.message);
        }
        throw new Error(
          profileError?.message || "No tienes permiso para actualizar este avatar"
        );
      }

      const previousPaths = (previousFiles || [])
        .map((storedFile) => `${userId}/${storedFile.name}`)
        .filter((path) => path !== fileName);
      if (previousPaths.length > 0) {
        const { error: removeError } = await supabase.storage
          .from("avatars")
          .remove(previousPaths);
        if (removeError) {
          console.warn("No se pudieron retirar avatares antiguos:", removeError.message);
        }
      }

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  static async deleteUserStorage(userId: string): Promise<void> {
    const buckets = ["avatars", "games-images", "digital-products"] as const;

    for (const bucket of buckets) {
      while (true) {
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list(userId, { limit: 100 });
        if (listError) throw new Error(listError.message);

        const paths = (files || []).map((file) => `${userId}/${file.name}`);
        if (paths.length === 0) break;

        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove(paths);
        if (removeError) throw new Error(removeError.message);
      }
    }
  }
}

export const mapProfileToMaster = (profile: Profile): Master => ({
  id: profile.id,
  username: profile.fullName.toLowerCase().replace(/\s+/g, "") || profile.id,
  displayName: profile.fullName || "Master",
  email: "hidden",
  avatar: profile.avatarUrl || FALLBACK_AVATAR_URL,
  bio: profile.bio || "Sin biografía.",
  experiencia: profile.experiencia || "Intermedio",
  sistemas: profile.sistemas as Master["sistemas"],
  tiposPartida: profile.tiposPartida as Master["tiposPartida"],
  disponibilidad: profile.disponibilidad || "Disponible",
  estilos: profile.estilos as Master["estilos"],
  idiomas: profile.idiomas as Master["idiomas"],
  precioPorSesion: profile.precioPorSesion || "Gratis",
  duracionSesion: profile.duracionSesion as Master["duracionSesion"],
  numeroJugadores: profile.numeroJugadores as Master["numeroJugadores"],
  rating: profile.rating || 0,
  totalReviews: profile.totalReviews || 0,
  publishedSessions: profile.publishedSessions || 0,
  completedSessions: profile.completedSessions || 0,
  cancelledSessions: profile.cancelledSessions || 0,
  playersServed: profile.playersServed || 0,
  digitalProducts: profile.digitalProducts || 0,
  digitalSales: profile.digitalSales || 0,
  rankingScore: profile.rankingScore || 0,
  isFeatured: profile.isFeatured || false,
  timezone: profile.timezone || "Europe/Madrid",
  createdAt: new Date(profile.updatedAt),
  lastActive: new Date(profile.updatedAt),
});
