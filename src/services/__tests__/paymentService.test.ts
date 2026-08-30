import { beforeEach, describe, expect, it, vi } from "vitest";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("../../lib/supabase", () => ({
  supabase: { functions: { invoke } },
}));

import PaymentService from "../paymentService";

describe("PaymentService", () => {
  beforeEach(() => {
    invoke.mockReset();
    vi.stubEnv("VITE_SUPABASE_URL", "https://project.supabase.co");
  });

  it("only accepts Stripe hosted Checkout URLs", async () => {
    invoke.mockResolvedValue({
      data: { checkoutUrl: "https://checkout.stripe.com/c/pay/test" },
      error: null,
    });

    await expect(PaymentService.iniciarPago("game-1")).resolves.toBe(
      "https://checkout.stripe.com/c/pay/test"
    );
    expect(invoke).toHaveBeenCalledWith("create-checkout-session", {
      body: { gameId: "game-1" },
    });
  });

  it("rejects an unexpected redirect returned by the backend", async () => {
    invoke.mockResolvedValue({
      data: { checkoutUrl: "https://attacker.example/checkout" },
      error: null,
    });

    await expect(PaymentService.iniciarPago("game-1")).rejects.toThrow(
      "URL de pago válida"
    );
  });

  it("queries payment status without trusting the landing page", async () => {
    invoke.mockResolvedValue({
      data: {
        gameId: "game-1",
        status: "paid",
        paidAt: "2026-08-30T20:00:00Z",
        refundedAt: null,
        fulfillmentType: "digital_download",
        downloadReady: true,
      },
      error: null,
    });

    await expect(PaymentService.consultarPago("cs_test_123")).resolves.toMatchObject({
      gameId: "game-1",
      status: "paid",
    });
  });

  it("rejects unknown payment states returned by the backend", async () => {
    invoke.mockResolvedValue({
      data: {
        gameId: "game-1",
        status: "approved_by_attacker",
        paidAt: null,
        refundedAt: null,
        fulfillmentType: "digital_download",
        downloadReady: true,
      },
      error: null,
    });

    await expect(PaymentService.consultarPago("cs_test_123")).rejects.toThrow(
      "respuesta del pago"
    );
  });

  it("accepts only signed download URLs from the configured private storage", async () => {
    invoke.mockResolvedValue({
      data: {
        url: "https://project.supabase.co/storage/v1/object/sign/digital-products/master/file.pdf?token=signed",
        fileName: "aventura.pdf",
      },
      error: null,
    });

    await expect(
      PaymentService.obtenerDescargaDigital("game-1")
    ).resolves.toMatchObject({ fileName: "aventura.pdf" });
  });

  it("rejects a download redirect to an external host", async () => {
    invoke.mockResolvedValue({
      data: { url: "https://attacker.example/file.rar", fileName: "file.rar" },
      error: null,
    });

    await expect(
      PaymentService.obtenerDescargaDigital("game-1")
    ).rejects.toThrow("enlace de descarga");
  });
});
