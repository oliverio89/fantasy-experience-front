/**
 * Tipos de la base de datos de Supabase — generados manualmente.
 *
 * Para regenerarlos automáticamente cuando la DB esté configurada:
 *   npx supabase gen types typescript --project-id <tu-project-id> > src/lib/database.types.ts
 */

export type UserRole = "admin" | "master" | "player";
export type GameType = "Digital" | "Presencial" | "Online" | "Híbrida";
export type GameStatus = "active" | "full" | "cancelled" | "completed";
export type PaymentOrderStatus =
  | "creating"
  | "pending"
  | "paid"
  | "expired"
  | "failed"
  | "refund_pending"
  | "refunded";
export type PaymentFulfillmentType = "reservation" | "digital_download";
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
          city: string | null;
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
          terms_accepted_at: string | null;
          terms_version: string | null;
        };
        Insert: {
          id: string; // FK a auth.users, obligatorio
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
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
          terms_accepted_at?: string | null;
          terms_version?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
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
          terms_accepted_at?: string | null;
          terms_version?: string | null;
        };
        Relationships: [];
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
          currency: string;
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
          current_players: number;
          pending_players: number;
          digital_asset_path: string | null;
          digital_file_name: string | null;
          digital_file_size_bytes: number | null;
          digital_mime_type: string | null;
          digital_version: number;
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
          currency?: string;
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
          current_players?: number;
          pending_players?: number;
          digital_asset_path?: string | null;
          digital_file_name?: string | null;
          digital_file_size_bytes?: number | null;
          digital_mime_type?: string | null;
          digital_version?: number;
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
          currency?: string;
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
          current_players?: number;
          pending_players?: number;
          digital_asset_path?: string | null;
          digital_file_name?: string | null;
          digital_file_size_bytes?: number | null;
          digital_mime_type?: string | null;
          digital_version?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "games_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "game_participants_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_participants_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // Tablas financieras privadas; sólo las Edge Functions usan sus datos.
      payment_orders: {
        Row: {
          id: string;
          game_id: string | null;
          player_id: string;
          game_title: string;
          amount_cents: number;
          currency: string;
          status: PaymentOrderStatus;
          fulfillment_type: PaymentFulfillmentType;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          checkout_url: string | null;
          expires_at: string | null;
          paid_at: string | null;
          refunded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id?: string | null;
          player_id: string;
          game_title: string;
          amount_cents: number;
          currency?: string;
          status?: PaymentOrderStatus;
          fulfillment_type?: PaymentFulfillmentType;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          checkout_url?: string | null;
          expires_at?: string | null;
          paid_at?: string | null;
          refunded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          game_id?: string | null;
          status?: PaymentOrderStatus;
          fulfillment_type?: PaymentFulfillmentType;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          checkout_url?: string | null;
          expires_at?: string | null;
          paid_at?: string | null;
          refunded_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_orders_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_orders_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      digital_entitlements: {
        Row: {
          id: string;
          game_id: string;
          buyer_id: string;
          payment_order_id: string;
          status: "active" | "revoked" | "refunded";
          granted_at: string;
          revoked_at: string | null;
          last_downloaded_at: string | null;
          download_count: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          buyer_id: string;
          payment_order_id: string;
          status?: "active" | "revoked" | "refunded";
          granted_at?: string;
          revoked_at?: string | null;
          last_downloaded_at?: string | null;
          download_count?: number;
        };
        Update: {
          status?: "active" | "revoked" | "refunded";
          revoked_at?: string | null;
          last_downloaded_at?: string | null;
          download_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "digital_entitlements_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "digital_entitlements_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "digital_entitlements_payment_order_id_fkey";
            columns: ["payment_order_id"];
            isOneToOne: true;
            referencedRelation: "payment_orders";
            referencedColumns: ["id"];
          }
        ];
      };

      stripe_webhook_events: {
        Row: {
          event_id: string;
          event_type: string;
          order_id: string | null;
          result: Record<string, unknown>;
          processed_at: string;
        };
        Insert: {
          event_id: string;
          event_type: string;
          order_id?: string | null;
          result?: Record<string, unknown>;
          processed_at?: string;
        };
        Update: {
          result?: Record<string, unknown>;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "payment_orders";
            referencedColumns: ["id"];
          }
        ];
      };

      // ─────────────────────────────────────────────
      // master_reviews — reseñas verificadas de partidas completadas
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
        Relationships: [
          {
            foreignKeyName: "master_reviews_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "master_reviews_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "master_reviews_partida_id_fkey";
            columns: ["partida_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: "reservation_created" | "reservation_cancelled" | "game_cancelled" | "game_completed";
          title: string;
          message: string;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          type: "reservation_created" | "reservation_cancelled" | "game_cancelled" | "game_completed";
          title: string;
          message: string;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      master_videos: {
        Row: {
          id: string;
          master_id: string;
          youtube_url: string;
          title: string;
          description: string | null;
          game_system: string | null;
          num_players: number | null;
          duration_minutes: number | null;
          played_at: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          master_id: string;
          youtube_url: string;
          title: string;
          description?: string | null;
          game_system?: string | null;
          num_players?: number | null;
          duration_minutes?: number | null;
          played_at?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          youtube_url?: string;
          title?: string;
          description?: string | null;
          game_system?: string | null;
          num_players?: number | null;
          duration_minutes?: number | null;
          played_at?: string | null;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "master_videos_master_id_fkey";
            columns: ["master_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      join_game: {
        Args: { p_game_id: string };
        Returns: {
          gameId: string;
          currentPlayers: number;
          maxPlayers: number;
        };
      };
      leave_game: {
        Args: { p_game_id: string };
        Returns: { gameId: string; left: boolean };
      };
      set_game_status: {
        Args: { p_game_id: string; p_status: "active" | "cancelled" | "completed" };
        Returns: undefined;
      };
      delete_my_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_game_contact: {
        Args: { p_game_id: string };
        Returns: string | null;
      };
      get_master_public_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Array<{
          master_id: string;
          published_sessions: number;
          completed_sessions: number;
          cancelled_sessions: number;
          players_served: number;
          digital_products: number;
          digital_sales: number;
          average_rating: number;
          review_count: number;
          ranking_score: number;
          is_featured: boolean;
        }>;
      };
      get_public_master_reviews: {
        Args: { p_master_id: string; p_limit?: number; p_offset?: number };
        Returns: Array<{
          id: string;
          partida_id: string;
          game_title: string;
          rating: number;
          comment: string;
          created_at: string;
        }>;
      };
      has_digital_entitlement: {
        Args: { p_game_id: string };
        Returns: boolean;
      };
      get_owned_digital_asset: {
        Args: { p_game_id: string };
        Returns: {
          path: string | null;
          fileName: string | null;
          fileSizeBytes: number | null;
          mimeType: string | null;
          version: number;
        } | null;
      };
    };
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
