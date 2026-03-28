import { supabase } from "../lib/supabase";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  bio?: string;
  sistemas: string[];
  tiposPartida: string[];
  tags: string[];
  estilos: string[];
  duracionSesion: string[];
  numeroJugadores: string[];
  idiomas: string[];
  updatedAt: string;
  // Computed fields
  rating?: number;
  totalPartidas?: number;
}

export class ProfileService {
  /**
   * Mapea row de DB a objeto Profile
   */
  private static mapProfileFromDB(row: any): Profile {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      sistemas: row.sistemas || [],
      tiposPartida: row.tipos_partida || [],
      tags: row.tags || [],
      estilos: row.estilos || [],
      duracionSesion: row.duracion_sesion || [],
      numeroJugadores: row.numero_jugadores || [],
      idiomas: row.idiomas || [],
      updatedAt: row.updated_at,
    };
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Si no existe perfil, retornamos null
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }

      return this.mapProfileFromDB(data);
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
      // 1. Obtener todas las partidas activas/creadas
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select("master_id, game_system, game_type");

      if (gamesError) throw gamesError;

      // 2. Extraer IDs de masters únicos
      const masterIds = Array.from(
        new Set(gamesData.map((g) => g.master_id).filter((id) => id))
      );

      if (masterIds.length === 0) return [];

      // 3. Obtener perfiles de esos masters
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", masterIds);

      if (profilesError) throw profilesError;

      // 4. Mapear y enriquecer perfiles con datos agregados de sus partidas
      const profiles = profilesData.map((p) => {
        const profile = this.mapProfileFromDB(p);

        // Filtrar partidas de este master
        const masterGames = gamesData.filter((g) => g.master_id === p.id);

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
      return [];
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
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.fullName !== undefined)
        dbUpdates.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined)
        dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.sistemas !== undefined) dbUpdates.sistemas = updates.sistemas;
      if (updates.tiposPartida !== undefined)
        dbUpdates.tipos_partida = updates.tiposPartida;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.estilos !== undefined) dbUpdates.estilos = updates.estilos;
      if (updates.duracionSesion !== undefined)
        dbUpdates.duracion_sesion = updates.duracionSesion;
      if (updates.numeroJugadores !== undefined)
        dbUpdates.numero_jugadores = updates.numeroJugadores;
      if (updates.idiomas !== undefined) dbUpdates.idiomas = updates.idiomas;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId);

      if (error) throw new Error(error.message);
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

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  /**
   * Actualiza la URL del avatar en la tabla profiles
   */
  static async updateAvatarUrl(
    userId: string,
    avatarUrl: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error("Error updating profile avatar:", error);
      throw error;
    }
  }
}
