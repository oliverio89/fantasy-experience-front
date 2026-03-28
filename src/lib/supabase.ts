import { createClient } from "@supabase/supabase-js";

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_ANON_KEY;

// Validar que las variables estén definidas
if (!supabaseUrl) {
  throw new Error(
    "Missing env.VITE_PUBLIC_SUPABASE_URL - Por favor, configura la URL de Supabase en tu archivo .env"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing env.VITE_ANON_KEY - Por favor, configura la clave anónima de Supabase en tu archivo .env"
  );
}

// Nota: No loguear información sensible en producción

// Crear y exportar el cliente de Supabase
// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
