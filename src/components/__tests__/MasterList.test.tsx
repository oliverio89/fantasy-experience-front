import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MasterList from "../master-list";
import {
  DEFAULT_MASTER_FILTERS,
  Master,
  MasterFilters,
} from "../../types/masters";

vi.mock("../UnifiedMasterCard", () => ({
  default: ({ master }: { master: Master }) => (
    <div>{master.displayName}</div>
  ),
}));

const makeMaster = (
  id: string,
  displayName: string,
  price: Master["precioPorSesion"],
  type: Master["tiposPartida"][number]
): Master => ({
  id,
  username: displayName.toLowerCase(),
  displayName,
  email: "hidden",
  avatar: "/user.svg",
  bio: "Master de prueba",
  experiencia: "Intermedio",
  sistemas: ["Dungeons & Dragons 5e"],
  tiposPartida: [type],
  disponibilidad: "Disponible",
  estilos: ["Narrativo"],
  idiomas: ["Español"],
  precioPorSesion: price,
  duracionSesion: ["3-4 horas"],
  numeroJugadores: ["3-4 jugadores"],
  rating: 4,
  totalReviews: 2,
  publishedSessions: 6,
  completedSessions: 4,
  cancelledSessions: 0,
  playersServed: 18,
  digitalProducts: 1,
  digitalSales: 3,
  rankingScore: 82,
  isFeatured: true,
  timezone: "Europe/Madrid",
  createdAt: new Date("2026-01-01"),
  lastActive: new Date("2026-01-01"),
});

const masters = [
  makeMaster("free", "Master Gratis", "Gratis", "Online"),
  makeMaster("paid", "Master Pago", "11-20€", "Presencial"),
];

const renderWithFilters = (filters: MasterFilters) =>
  render(<MasterList masters={masters} filters={filters} />);

describe("MasterList filters", () => {
  it("filters by price without altering the game type filter", () => {
    renderWithFilters({ ...DEFAULT_MASTER_FILTERS, precioMin: "11-20€" });

    expect(screen.getByText("Master Pago")).toBeInTheDocument();
    expect(screen.queryByText("Master Gratis")).not.toBeInTheDocument();
  });

  it("filters game type independently from price", () => {
    renderWithFilters({
      ...DEFAULT_MASTER_FILTERS,
      tiposPartida: ["Online"],
    });

    expect(screen.getByText("Master Gratis")).toBeInTheDocument();
    expect(screen.queryByText("Master Pago")).not.toBeInTheDocument();
  });

  it("places verified featured masters before unqualified profiles", () => {
    const featured = { ...masters[0], rankingScore: 70, isFeatured: true };
    const unqualified = { ...masters[1], rankingScore: 95, isFeatured: false };
    render(
      <MasterList
        masters={[unqualified, featured]}
        filters={DEFAULT_MASTER_FILTERS}
      />
    );

    expect(screen.getAllByText(/Master /).map((node) => node.textContent)).toEqual([
      "Master Gratis",
      "Master Pago",
    ]);
  });
});
