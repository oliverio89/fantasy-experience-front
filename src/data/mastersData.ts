// Datos de ejemplo para Masters
// Archivo: src/data/mastersData.ts

import {
  Master,
  SistemaJuego,
  TipoPartida,
  ExperienciaMaster,
  DisponibilidadMaster,
  EstiloJuego,
  Idioma,
  RangoPrecio,
  DuracionSesion,
  NumeroJugadores,
} from "../types/masters";

// Datos hardcodeados de masters para desarrollo
export const MASTERS_DATA: Master[] = [
  {
    id: "master-001",
    username: "dragonmaster_alex",
    displayName: "Alex Dragonheart",
    email: "alex@example.com",
    avatar: "/ellipse-3@2x.png",
    bio: "Master con más de 8 años de experiencia dirigiendo D&D. Especializado en campañas épicas con enfoque narrativo y combates tácticos.",
    experiencia: "Experto",
    sistemas: ["Dungeons & Dragons 5e", "Pathfinder 2e", "Call of Cthulhu"],
    tiposPartida: ["Digital", "Presencial"],
    disponibilidad: "Disponible",
    estilos: ["Narrativo", "Táctico", "Campaña"],
    idiomas: ["Español", "Inglés"],
    precioPorSesion: "11-20€",
    duracionSesion: ["3-4 horas", "4-6 horas"],
    numeroJugadores: ["3-4 jugadores", "5-6 jugadores"],
    rating: 4.5,
    totalReviews: 47,
    timezone: "CET",
    createdAt: new Date("2023-01-15"),
    lastActive: new Date("2024-10-25"),
    activePartidas: ["partida-001", "partida-002"],
    upcomingPartidas: ["partida-003"],
    completedPartidas: ["partida-004", "partida-005"],
  },
  {
    id: "master-002",
    username: "cthulhu_keeper",
    displayName: "Sarah Lovecraft",
    email: "sarah@example.com",
    avatar: "/ellipse-3-1@2x.png",
    bio: "Keeper especializada en Call of Cthulhu y horror cósmico. Creo atmósferas inmersivas que mantendrán a tus jugadores al borde del asiento.",
    experiencia: "Experto",
    sistemas: ["Call of Cthulhu", "Vampiro: La Mascarada", "World of Darkness"],
    tiposPartida: ["Digital", "Online"],
    disponibilidad: "Disponible",
    estilos: ["Horror", "Narrativo", "One-shot"],
    idiomas: ["Español"],
    precioPorSesion: "6-10€",
    duracionSesion: ["3-4 horas"],
    numeroJugadores: ["3-4 jugadores", "5-6 jugadores"],
    rating: 4.9,
    totalReviews: 32,
    timezone: "CET",
    createdAt: new Date("2023-03-20"),
    lastActive: new Date("2024-10-24"),
    activePartidas: ["partida-006"],
    upcomingPartidas: ["partida-007", "partida-008"],
    completedPartidas: ["partida-009"],
  },
  {
    id: "master-003",
    username: "vampire_storyteller",
    displayName: "Diego Nocturno",
    email: "diego@example.com",
    avatar: "/ellipse-3@2x.png",
    bio: "Storyteller de Vampiro: La Mascarada con enfoque en intriga política y drama personal. Experiencia en LARP y juegos de mesa.",
    experiencia: "Intermedio",
    sistemas: [
      "Vampiro: La Mascarada",
      "Hombre Lobo: El Apocalipsis",
      "Mago: La Ascensión",
    ],
    tiposPartida: ["Presencial", "Híbrida"],
    disponibilidad: "Solo fines de semana",
    estilos: ["Narrativo", "Serio", "Campaña"],
    idiomas: ["Español"],
    precioPorSesion: "1-5€",
    duracionSesion: ["4-6 horas"],
    numeroJugadores: ["3-4 jugadores"],
    rating: 3.5,
    totalReviews: 18,
    timezone: "CET",
    createdAt: new Date("2023-06-10"),
    lastActive: new Date("2024-10-22"),
    activePartidas: [],
    upcomingPartidas: ["partida-010"],
    completedPartidas: ["partida-011", "partida-012"],
  },
  {
    id: "master-004",
    username: "pathfinder_gm",
    displayName: "María Constructora",
    email: "maria@example.com",
    avatar: "/ellipse-3-1@2x.png",
    bio: "Game Master de Pathfinder especializada en construcción de mundos y aventuras personalizadas. Amante de los detalles y la inmersión.",
    experiencia: "Experto",
    sistemas: ["Pathfinder 1e", "Pathfinder 2e", "Dungeons & Dragons 5e"],
    tiposPartida: ["Digital", "Presencial"],
    disponibilidad: "Ocupado",
    estilos: ["Sandbox", "Narrativo", "Campaña"],
    idiomas: ["Español", "Inglés"],
    precioPorSesion: "21-30€",
    duracionSesion: ["4-6 horas", "6+ horas"],
    numeroJugadores: ["5-6 jugadores"],
    rating: 4.7,
    totalReviews: 29,
    timezone: "CET",
    createdAt: new Date("2023-02-28"),
    lastActive: new Date("2024-10-25"),
    activePartidas: ["partida-013", "partida-014"],
    upcomingPartidas: [],
    completedPartidas: ["partida-015", "partida-016", "partida-017"],
  },
  {
    id: "master-005",
    username: "fate_narrator",
    displayName: "Carlos Destino",
    email: "carlos@example.com",
    avatar: "/ellipse-3@2x.png",
    bio: "Narrador de FATE Core con enfoque en historias colaborativas. Experto en improvisación y creación de momentos épicos.",
    experiencia: "Intermedio",
    sistemas: ["FATE Core", "Savage Worlds", "Indie RPGs"],
    tiposPartida: ["Digital", "Online"],
    disponibilidad: "Disponible",
    estilos: ["Narrativo", "Mixto", "One-shot"],
    idiomas: ["Español", "Bilingüe (ES/EN)"],
    precioPorSesion: "6-10€",
    duracionSesion: ["2-3 horas", "3-4 horas"],
    numeroJugadores: ["3-4 jugadores"],
    rating: 4.5,
    totalReviews: 21,
    timezone: "CET",
    createdAt: new Date("2023-05-15"),
    lastActive: new Date("2024-10-25"),
    activePartidas: ["partida-018"],
    upcomingPartidas: ["partida-019"],
    completedPartidas: ["partida-020"],
  },
  {
    id: "master-006",
    username: "werewolf_alpha",
    displayName: "Luna Salvaje",
    email: "luna@example.com",
    avatar: "/ellipse-3-1@2x.png",
    bio: "Alpha de Hombre Lobo: El Apocalipsis. Experta en crear historias de supervivencia, naturaleza y conflicto entre tradición y modernidad.",
    experiencia: "Experto",
    sistemas: [
      "Hombre Lobo: El Apocalipsis",
      "World of Darkness",
      "Vampiro: La Mascarada",
    ],
    tiposPartida: ["Presencial"],
    disponibilidad: "Horario nocturno",
    estilos: ["Serio", "Narrativo", "Campaña"],
    idiomas: ["Español"],
    precioPorSesion: "11-20€",
    duracionSesion: ["4-6 horas"],
    numeroJugadores: ["5-6 jugadores"],
    rating: 4.6,
    totalReviews: 15,
    timezone: "CET",
    createdAt: new Date("2023-04-12"),
    lastActive: new Date("2024-10-23"),
    activePartidas: ["partida-021"],
    upcomingPartidas: ["partida-022"],
    completedPartidas: ["partida-023", "partida-024"],
  },
  {
    id: "master-007",
    username: "cyberpunk_netrunner",
    displayName: "Neo Matrix",
    email: "neo@example.com",
    avatar: "/ellipse-3@2x.png",
    bio: "Netrunner especializado en Cyberpunk 2020/Red. Creo distopías cyberpunk inmersivas con tecnología, corporaciones y rebelión.",
    experiencia: "Intermedio",
    sistemas: ["Cyberpunk 2020/Red", "Shadowrun", "Indie RPGs"],
    tiposPartida: ["Digital", "Online"],
    disponibilidad: "Disponible",
    estilos: ["Táctico", "Serio", "One-shot"],
    idiomas: ["Español", "Inglés"],
    precioPorSesion: "6-10€",
    duracionSesion: ["3-4 horas"],
    numeroJugadores: ["3-4 jugadores", "5-6 jugadores"],
    rating: 4.3,
    totalReviews: 12,
    timezone: "CET",
    createdAt: new Date("2023-07-08"),
    lastActive: new Date("2024-10-25"),
    activePartidas: [],
    upcomingPartidas: ["partida-025"],
    completedPartidas: ["partida-026"],
  },
  {
    id: "master-008",
    username: "starwars_jedi",
    displayName: "Obi-Wan Kenobi",
    email: "obiwan@example.com",
    avatar: "/ellipse-3-1@2x.png",
    bio: "Jedi Master especializado en Star Wars RPG. Experto en crear aventuras épicas en la galaxia muy, muy lejana con la Fuerza como guía.",
    experiencia: "Profesional",
    sistemas: ["Star Wars RPG", "Dungeons & Dragons 5e", "FATE Core"],
    tiposPartida: ["Digital", "Presencial", "Online"],
    disponibilidad: "Disponible",
    estilos: ["Narrativo", "Campaña", "Mixto"],
    idiomas: ["Español", "Inglés"],
    precioPorSesion: "30€+",
    duracionSesion: ["4-6 horas", "6+ horas"],
    numeroJugadores: ["5-6 jugadores"],
    rating: 5.0,
    totalReviews: 8,
    timezone: "CET",
    createdAt: new Date("2023-01-01"),
    lastActive: new Date("2024-10-25"),
    activePartidas: ["partida-027", "partida-028"],
    upcomingPartidas: ["partida-029", "partida-030"],
    completedPartidas: ["partida-031", "partida-032", "partida-033"],
  },
  {
    id: "master-009",
    username: "novice_dm",
    displayName: "Ana Principiante",
    email: "ana@example.com",
    avatar: "/ellipse-3@2x.png",
    bio: "Nueva en el mundo del rol pero con mucha pasión y ganas de aprender. Especializada en D&D 5e con enfoque en diversión y aprendizaje mutuo.",
    experiencia: "Novato",
    sistemas: ["Dungeons & Dragons 5e"],
    tiposPartida: ["Digital"],
    disponibilidad: "Solo entre semana",
    estilos: ["Narrativo", "One-shot"],
    idiomas: ["Español"],
    precioPorSesion: "Gratis",
    duracionSesion: ["2-3 horas"],
    numeroJugadores: ["3-4 jugadores"],
    rating: 2.5,
    totalReviews: 5,
    timezone: "CET",
    createdAt: new Date("2024-09-15"),
    lastActive: new Date("2024-10-24"),
    activePartidas: [],
    upcomingPartidas: ["partida-034"],
    completedPartidas: ["partida-035"],
  },
];

// Función helper para obtener masters por sistema
export const getMastersBySistema = (sistema: string): Master[] => {
  return MASTERS_DATA.filter((master) =>
    master.sistemas.some((s) => s.toLowerCase().includes(sistema.toLowerCase()))
  );
};

// Función helper para obtener masters por experiencia
export const getMastersByExperiencia = (experiencia: string): Master[] => {
  return MASTERS_DATA.filter((master) => master.experiencia === experiencia);
};

// Función helper para obtener masters disponibles
export const getMastersDisponibles = (): Master[] => {
  return MASTERS_DATA.filter(
    (master) => master.disponibilidad === "Disponible"
  );
};

// Función helper para obtener masters por rating mínimo
export const getMastersByRatingMin = (ratingMin: number): Master[] => {
  return MASTERS_DATA.filter((master) => master.rating >= ratingMin);
};

// Función helper para buscar masters por texto
export const searchMasters = (query: string): Master[] => {
  const searchTerm = query.toLowerCase();
  return MASTERS_DATA.filter(
    (master) =>
      master.displayName.toLowerCase().includes(searchTerm) ||
      master.username.toLowerCase().includes(searchTerm) ||
      master.bio.toLowerCase().includes(searchTerm) ||
      master.sistemas.some((sistema) =>
        sistema.toLowerCase().includes(searchTerm)
      )
  );
};

// Función helper para obtener estadísticas de masters
export const getMastersStats = () => {
  const total = MASTERS_DATA.length;
  const disponibles = getMastersDisponibles().length;
  const promedioRating =
    MASTERS_DATA.reduce((sum, master) => sum + master.rating, 0) / total;

  const porExperiencia = MASTERS_DATA.reduce((acc, master) => {
    acc[master.experiencia] = (acc[master.experiencia] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const porSistema = MASTERS_DATA.reduce((acc, master) => {
    master.sistemas.forEach((sistema) => {
      acc[sistema] = (acc[sistema] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    disponibles,
    promedioRating: Math.round(promedioRating * 10) / 10,
    porExperiencia,
    porSistema,
  };
};
