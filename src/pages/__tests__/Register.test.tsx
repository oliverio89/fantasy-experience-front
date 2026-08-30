import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "../Register";

const signUp = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

vi.mock("../../lib/supabase", () => ({
  supabase: { auth: { signUp } },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigate };
});

const fillRequiredFields = () => {
  fireEvent.change(screen.getByPlaceholderText("Ingresa tu nombre"), {
    target: { name: "name", value: "Jugador Uno" },
  });
  fireEvent.change(screen.getByPlaceholderText("Ingresa tu email"), {
    target: { name: "email", value: "player@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Ingresa tu ciudad"), {
    target: { name: "city", value: "  Sevilla  " },
  });
  fireEvent.change(screen.getByPlaceholderText("Elige tu contraseña"), {
    target: { name: "password", value: "password-segura" },
  });
  fireEvent.change(screen.getByPlaceholderText("Repite tu contraseña"), {
    target: { name: "confirmPassword", value: "password-segura" },
  });
};

describe("Register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not register without legal acceptance", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillRequiredFields();
    fireEvent.submit(document.querySelector("form")!);

    expect(
      await screen.findByText("Aceptación necesaria")
    ).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("records the legal version when registering", async () => {
    signUp.mockResolvedValueOnce({ error: null });
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    fillRequiredFields();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: expect.objectContaining({
              legal_accepted: true,
              legal_version: "2026-08-30",
              city: "Sevilla",
            }),
          }),
        })
      );
    });
  });
});
