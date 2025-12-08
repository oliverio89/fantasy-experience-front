/**
 * Tipos de la base de datos de Supabase
 *
 * NOTA: Estos tipos deberían generarse automáticamente usando:
 * npx supabase gen types typescript --project-id <tu-project-id> > src/lib/database.types.ts
 *
 * Por ahora, definimos una estructura básica basada en la interfaz Partida
 */

export interface Database {
  public: {
    Tables: {
      partidas: {
        Row: {
          id: string | number;
          titulo: string;
          master_name: string;
          sistema_juego: string;
          fecha?: string;
          descripcion?: string;
          imagen_url: string;
          tipo_partida: "digital" | "presencial" | "online";
          rating: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string | number;
          titulo: string;
          master_name: string;
          sistema_juego: string;
          fecha?: string;
          descripcion?: string;
          imagen_url: string;
          tipo_partida: "digital" | "presencial" | "online";
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | number;
          titulo?: string;
          master_name?: string;
          sistema_juego?: string;
          fecha?: string;
          descripcion?: string;
          imagen_url?: string;
          tipo_partida?: "digital" | "presencial" | "online";
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
