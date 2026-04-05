/**
 * Tipos de la base de datos de Supabase — generados manualmente.
 *
 * Para regenerarlos automáticamente cuando la DB esté configurada:
 *   npx supabase gen types typescript --project-id <tu-project-id> > src/lib/database.types.ts
 */

export type UserRole = "admin" | "master" | "player";
export type GameType = "Digital" | "Presencial" | "Online" | "Híbrida";
export type GameStatus = "active" | "full" | "cancelled" | "completed";
export type Temporalidad =
  | "One-shot"
  | "Campaña corta"
  | "Campaña larga"
  | "Abierta";
export type ExperienciaMaster =
  | "Novato"
  | "Intermedio"
  | "Experto"
  | "Profesional";
export type DisponibilidadMaster =
  | "Disponible"
  | "Ocupado"
  | "Fuera de línea"
  | "Solo fines de semana"
  | "Solo entre semana"
  | "Horario nocturno"
  | "Horario diurno";
export type RangoPrecio =
  | "Gratis"
  | "1-5€"
  | "6-10€"
  | "11-20€"
  | "21-30€"
  | "30€+";

export interface Database {
  public: {
    Tables: {
      // ─────────────────────────────────────────────
      // profiles — extiende auth.users
      // ─────────────────────────────────────────────
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          // Arrays de preferencias
          sistemas: string[];
          tipos_partida: string[];
          estilos: string[];
          idiomas: string[];
          tags: string[];
          duracion_sesion: string[];
          numero_jugadores: string[];
          // Campos de master
          experiencia: ExperienciaMaster | null;
          disponibilidad: DisponibilidadMaster | null;
          precio_por_sesion: RangoPrecio | null;
          timezone: string | null;
          // Métricas
          rating: number;
          total_reviews: number;
          // Timestamps
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // FK a auth.users, obligatorio
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          sistemas?: string[];
          tipos_partida?: string[];
          estilos?: string[];
          idiomas?: string[];
          tags?: string[];
          duracion_sesion?: string[];
          numero_jugadores?: string[];
          experiencia?: ExperienciaMaster | null;
          disponibilidad?: DisponibilidadMaster | null;
          precio_por_sesion?: RangoPrecio | null;
          timezone?: string | null;
          rating?: number;
          total_reviews?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
          sistemas?: string[];
          tipos_partida?: string[];
          estilos?: string[];
          idiomas?: string[];
          tags?: string[];
          duracion_sesion?: string[];
          numero_jugadores?: string[];
          experiencia?: ExperienciaMaster | null;
          disponibilidad?: DisponibilidadMaster | null;
          precio_por_sesion?: RangoPrecio | null;
          timezone?: string | null;
          rating?: number;
          total_reviews?: number;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────────
      // games — partidas publicadas por masters
      // ─────────────────────────────────────────────
      games: {
        Row: {
          id: string;
          master_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          game_system: string;
          game_type: GameType;
          tags: string[];
          language: string;
          min_age: number | null;
          start_date: string | null;
          max_players: number;
          price: number;
          city: string | null;
          schedule: string | null;
          temporalidad: Temporalidad | null;
          recommendations: string | null;
          master_contact: string | null;
          tools_needed: string[] | null;
          use_x_card: boolean;
          camera_mandatory: boolean;
          microphone_mandatory: boolean;
          rating: number;
          status: GameStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          game_system: string;
          game_type: GameType;
          tags?: string[];
          language?: string;
          min_age?: number | null;
          start_date?: string | null;
          max_players?: number;
          price?: number;
          city?: string | null;
          schedule?: string | null;
          temporalidad?: Temporalidad | null;
          recommendations?: string | null;
          master_contact?: string | null;
          tools_needed?: string[] | null;
          use_x_card?: boolean;
          camera_mandatory?: boolean;
          microphone_mandatory?: boolean;
          rating?: number;
          status?: GameStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          master_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          game_system?: string;
          game_type?: GameType;
          tags?: string[];
          language?: string;
          min_age?: number | null;
          start_date?: string | null;
          max_players?: number;
          price?: number;
          city?: string | null;
          schedule?: string | null;
          temporalidad?: Temporalidad | null;
          recommendations?: string | null;
          master_contact?: string | null;
          tools_needed?: string[] | null;
          use_x_card?: boolean;
          camera_mandatory?: boolean;
          microphone_mandatory?: boolean;
          rating?: number;
          status?: GameStatus;
          updated_at?: string;
        };
      };

      // ─────────────────────────────────────────────
      // game_participants — jugadores apuntados
      // ─────────────────────────────────────────────
      game_participants: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          joined_at?: string;
        };
        Update: {
          joined_at?: string;
        };
      };

      // ─────────────────────────────────────────────
      // master_reviews — reseñas (implementación futura)
      // ─────────────────────────────────────────────
      master_reviews: {
        Row: {
          id: string;
          master_id: string;
          player_id: string;
          partida_id: string | null;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          player_id: string;
          partida_id?: string | null;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
        };
      };
    };
  };
}
