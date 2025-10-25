// Tipos para el sistema de Masters
// Archivo: src/types/masters.ts

// Sistemas de juego disponibles
export type SistemaJuego =
  | "Dungeons & Dragons 5e"
  | "Dungeons & Dragons 3.5e"
  | "Pathfinder 1e"
  | "Pathfinder 2e"
  | "Call of Cthulhu"
  | "Vampiro: La Mascarada"
  | "Hombre Lobo: El Apocalipsis"
  | "Mago: La Ascensión"
  | "FATE Core"
  | "Savage Worlds"
  | "GURPS"
  | "World of Darkness"
  | "Shadowrun"
  | "Cyberpunk 2020/Red"
  | "Star Wars RPG"
  | "Warhammer 40k RPG"
  | "D&D 4e"
  | "D&D B/X"
  | "OSR (Old School Revival)"
  | "Indie RPGs"
  | "Otros";

// Tipos de partida
export type TipoPartida = "Digital" | "Presencial" | "Online" | "Híbrida";

// Experiencia del master
export type ExperienciaMaster =
  | "Novato"
  | "Intermedio"
  | "Experto"
  | "Profesional";

// Disponibilidad del master
export type DisponibilidadMaster =
  | "Disponible"
  | "Ocupado"
  | "Fuera de línea"
  | "Solo fines de semana"
  | "Solo entre semana"
  | "Horario nocturno"
  | "Horario diurno";

// Estilos de juego
export type EstiloJuego =
  | "Narrativo"
  | "Táctico"
  | "Sandbox"
  | "Railroad"
  | "One-shot"
  | "Campaña"
  | "Horror"
  | "Comedia"
  | "Serio"
  | "Mixto";

// Idiomas disponibles
export type Idioma =
  | "Español"
  | "Inglés"
  | "Francés"
  | "Alemán"
  | "Italiano"
  | "Portugués"
  | "Bilingüe (ES/EN)";

// Rango de precios
export type RangoPrecio =
  | "Gratis"
  | "1-5€"
  | "6-10€"
  | "11-20€"
  | "21-30€"
  | "30€+";

// Duración de sesión
export type DuracionSesion =
  | "2-3 horas"
  | "3-4 horas"
  | "4-6 horas"
  | "6+ horas"
  | "Flexible";

// Número de jugadores
export type NumeroJugadores =
  | "1-2 jugadores"
  | "3-4 jugadores"
  | "5-6 jugadores"
  | "7+ jugadores"
  | "Flexible";

// Interface principal del Master
export interface Master {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  experiencia: ExperienciaMaster;
  sistemas: SistemaJuego[];
  tiposPartida: TipoPartida[];
  disponibilidad: DisponibilidadMaster;
  estilos: EstiloJuego[];
  idiomas: Idioma[];
  precioPorSesion: RangoPrecio;
  duracionSesion: DuracionSesion[];
  numeroJugadores: NumeroJugadores[];
  rating: number; // 0-5
  totalReviews: number;
  timezone: string;
  createdAt: Date;
  lastActive: Date;
  // Relaciones futuras
  activePartidas?: string[]; // IDs de partidas activas
  upcomingPartidas?: string[]; // IDs de partidas próximas
  completedPartidas?: string[]; // IDs de partidas completadas
  reviews?: MasterReview[];
}

// Interface para reviews de masters
export interface MasterReview {
  id: string;
  masterId: string;
  playerId: string;
  playerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  partidaId?: string; // ID de la partida relacionada
}

// Interface para filtros de masters
export interface MasterFilters {
  // Búsqueda de texto
  busqueda: string;

  // Filtros principales
  sistemas: SistemaJuego[];
  tiposPartida: TipoPartida[];
  experiencia: ExperienciaMaster[];
  disponibilidad: DisponibilidadMaster[];

  // Filtros secundarios
  estilos: EstiloJuego[];
  idiomas: Idioma[];
  precioMin: RangoPrecio | null;
  precioMax: RangoPrecio | null;
  ratingMin: number; // 0-5

  // Filtros adicionales
  duracion: DuracionSesion[];
  numeroJugadores: NumeroJugadores[];

  // Ordenamiento
  ordenarPor: "rating" | "nombre" | "experiencia" | "precio" | "fechaRegistro";
  ordenDireccion: "asc" | "desc";

  // Paginación
  pagina: number;
  resultadosPorPagina: number;
}

// Valores por defecto para filtros
export const DEFAULT_MASTER_FILTERS: MasterFilters = {
  busqueda: "",
  sistemas: [],
  tiposPartida: [],
  experiencia: [],
  disponibilidad: [],
  estilos: [],
  idiomas: [],
  precioMin: null,
  precioMax: null,
  ratingMin: 0,
  duracion: [],
  numeroJugadores: [],
  ordenarPor: "rating",
  ordenDireccion: "desc",
  pagina: 1,
  resultadosPorPagina: 12,
};

// Constantes para los sistemas de juego (para usar en componentes)
export const SISTEMAS_JUEGO: SistemaJuego[] = [
  "Dungeons & Dragons 5e",
  "Dungeons & Dragons 3.5e",
  "Pathfinder 1e",
  "Pathfinder 2e",
  "Call of Cthulhu",
  "Vampiro: La Mascarada",
  "Hombre Lobo: El Apocalipsis",
  "Mago: La Ascensión",
  "FATE Core",
  "Savage Worlds",
  "GURPS",
  "World of Darkness",
  "Shadowrun",
  "Cyberpunk 2020/Red",
  "Star Wars RPG",
  "Warhammer 40k RPG",
  "D&D 4e",
  "D&D B/X",
  "OSR (Old School Revival)",
  "Indie RPGs",
  "Otros",
];

// Sistemas más populares (para mostrar primero)
export const SISTEMAS_POPULARES: SistemaJuego[] = [
  "Dungeons & Dragons 5e",
  "Call of Cthulhu",
  "Vampiro: La Mascarada",
  "Hombre Lobo: El Apocalipsis",
  "FATE Core",
  "Pathfinder 2e",
];

// Constantes para tipos de partida
export const TIPOS_PARTIDA: TipoPartida[] = [
  "Digital",
  "Presencial",
  "Online",
  "Híbrida",
];

// Constantes para experiencia
export const EXPERIENCIA_MASTER: ExperienciaMaster[] = [
  "Novato",
  "Intermedio",
  "Experto",
  "Profesional",
];

// Constantes para disponibilidad
export const DISPONIBILIDAD_MASTER: DisponibilidadMaster[] = [
  "Disponible",
  "Ocupado",
  "Fuera de línea",
  "Solo fines de semana",
  "Solo entre semana",
  "Horario nocturno",
  "Horario diurno",
];

// Constantes para estilos de juego
export const ESTILOS_JUEGO: EstiloJuego[] = [
  "Narrativo",
  "Táctico",
  "Sandbox",
  "Railroad",
  "One-shot",
  "Campaña",
  "Horror",
  "Comedia",
  "Serio",
  "Mixto",
];

// Constantes para idiomas
export const IDIOMAS: Idioma[] = [
  "Español",
  "Inglés",
  "Francés",
  "Alemán",
  "Italiano",
  "Portugués",
  "Bilingüe (ES/EN)",
];

// Constantes para rangos de precio
export const RANGOS_PRECIO: RangoPrecio[] = [
  "Gratis",
  "1-5€",
  "6-10€",
  "11-20€",
  "21-30€",
  "30€+",
];

// Constantes para duración de sesión
export const DURACION_SESION: DuracionSesion[] = [
  "2-3 horas",
  "3-4 horas",
  "4-6 horas",
  "6+ horas",
  "Flexible",
];

// Constantes para número de jugadores
export const NUMERO_JUGADORES: NumeroJugadores[] = [
  "1-2 jugadores",
  "3-4 jugadores",
  "5-6 jugadores",
  "7+ jugadores",
  "Flexible",
];

// Función helper para obtener el color de disponibilidad
export const getDisponibilidadColor = (
  disponibilidad: DisponibilidadMaster
): string => {
  switch (disponibilidad) {
    case "Disponible":
      return "text-green-500";
    case "Ocupado":
      return "text-yellow-500";
    case "Fuera de línea":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

// Función helper para obtener el icono de disponibilidad
export const getDisponibilidadIcon = (
  disponibilidad: DisponibilidadMaster
): string => {
  switch (disponibilidad) {
    case "Disponible":
      return "🟢";
    case "Ocupado":
      return "🟡";
    case "Fuera de línea":
      return "🔴";
    default:
      return "⚪";
  }
};

// Función helper para formatear precio
export const formatPrecio = (precio: RangoPrecio): string => {
  switch (precio) {
    case "Gratis":
      return "Gratis";
    case "1-5€":
      return "1-5€";
    case "6-10€":
      return "6-10€";
    case "11-20€":
      return "11-20€";
    case "21-30€":
      return "21-30€";
    case "30€+":
      return "30€+";
    default:
      return "No especificado";
  }
};

// Función helper para obtener el nivel de experiencia como número
export const getExperienciaLevel = (experiencia: ExperienciaMaster): number => {
  switch (experiencia) {
    case "Novato":
      return 1;
    case "Intermedio":
      return 2;
    case "Experto":
      return 3;
    case "Profesional":
      return 4;
    default:
      return 0;
  }
};
