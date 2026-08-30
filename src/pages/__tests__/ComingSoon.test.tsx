import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ComingSoon from "../ComingSoon";

describe("ComingSoon", () => {
  it("explains that the feature is unavailable and provides a safe way home", () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/en-desarrollo", state: { feature: "Campañas" } },
        ]}
      >
        <ComingSoon />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Estamos trabajando en ello" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Campañas todavía no está disponible/)).toBeInTheDocument();
    expect(screen.getByText(/No se realizará ningún cobro/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
