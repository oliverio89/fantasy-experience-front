import { describe, expect, it, vi } from "vitest";
import { Database } from "../../lib/database.types";

vi.mock("../../lib/supabase", () => ({ supabase: {} }));

import PartidasService from "../partidasService";

type GameRow = Database["public"]["Tables"]["games"]["Row"];

const gameRow: GameRow = {
  id: "game-1",
  master_id: "master-1",
  title: "La cripta",
  description: "Aventura de prueba",
  image_url: null,
  game_system: "D&D 5e",
  game_type: "Online",
  tags: ["Terror"],
  language: "Español",
  min_age: 16,
  start_date: "2030-01-01T20:00:00.000Z",
  max_players: 5,
  price: 12.5,
  currency: "eur",
  city: null,
  schedule: "20:00",
  temporalidad: "One-shot",
  recommendations: "Dados",
  master_contact: "Discord",
  tools_needed: ["Discord", "Foundry"],
  use_x_card: true,
  camera_mandatory: false,
  microphone_mandatory: true,
  rating: 4.5,
  status: "active",
  current_players: 2,
  pending_players: 1,
  digital_asset_path: null,
  digital_file_name: null,
  digital_file_size_bytes: null,
  digital_mime_type: null,
  digital_version: 1,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("PartidasService mapping", () => {
  it("maps database fields and related profiles", () => {
    const partida = PartidasService.mapGameFromDB({
      ...gameRow,
      profiles: { full_name: "Ana Master" },
      game_participants: [
        {
          player_id: "player-1",
          profiles: { full_name: "Luis" },
        },
      ],
    });

    expect(partida).toMatchObject({
      id: "game-1",
      masterId: "master-1",
      masterName: "Ana Master",
      titulo: "La cripta",
      jugadores: "5",
      jugadoresActuales: 3,
      precio: "12.5",
      herramientas: ["Discord", "Foundry"],
      participantes: [{ id: "player-1", nombre: "Luis" }],
    });
  });

  it("normalizes form values and leaves trusted fields to the database", () => {
    const payload = PartidasService.mapGameToDB(
      {
        titulo: "La cripta",
        sistemaJuego: "D&D 5e",
        tipoPartida: "Online",
        jugadores: "5",
        precio: "12.5",
        edadMinima: "16",
        herramientas: "Discord, Foundry",
        status: "completed",
      },
      "master-1"
    );

    expect(payload).toMatchObject({
      master_id: "master-1",
      max_players: 5,
      price: 12.5,
      min_age: 16,
      tools_needed: ["Discord", "Foundry"],
    });
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("rating");
  });

  it("models a digital adventure as a product without date or seats", () => {
    const payload = PartidasService.mapGameToDB({
      titulo: "La cripta descargable",
      descripcion: "Una aventura completa lista para dirigir.",
      imagenUrl: "https://example.com/cover.webp",
      sistemaJuego: "D&D 5e",
      tipoPartida: "Digital",
      fecha: "2030-01-01T20:00:00.000Z",
      jugadores: 6,
      precio: 8.5,
      idioma: "Español",
      digitalAssetPath: "master-1/product.rar",
      digitalFileName: "la-cripta.rar",
      digitalFileSizeBytes: 2048,
      digitalMimeType: "application/vnd.rar",
      digitalVersion: 2,
    });

    expect(payload).toMatchObject({
      game_type: "Digital",
      start_date: null,
      max_players: 1,
      master_contact: null,
      city: null,
      digital_asset_path: "master-1/product.rar",
      digital_version: 2,
    });
  });
});
