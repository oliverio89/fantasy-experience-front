import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, rpc } = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: { getUser },
    rpc,
  },
}));

import ReviewService from "../reviewService";

describe("ReviewService validation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires authentication", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    await expect(
      ReviewService.saveReview({
        partidaId: "game-1",
        masterId: "master-1",
        rating: 5,
        comment: "Una sesión excelente",
      })
    ).rejects.toThrow("Debes iniciar sesión");
  });

  it("rejects ratings outside the accepted range before writing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "player-1" } } });

    await expect(
      ReviewService.saveReview({
        partidaId: "game-1",
        masterId: "master-1",
        rating: 6,
        comment: "Una sesión excelente",
      })
    ).rejects.toThrow("entre 1 y 5");
  });

  it("rejects comments that are too short before writing", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "player-1" } } });

    await expect(
      ReviewService.saveReview({
        partidaId: "game-1",
        masterId: "master-1",
        rating: 5,
        comment: "Bien",
      })
    ).rejects.toThrow("entre 10 y 1000");
  });

  it("loads only the anonymized public review projection", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          id: "review-1",
          partida_id: "game-1",
          game_title: "La cripta",
          rating: 5,
          comment: "Una dirección de juego excelente.",
          created_at: "2026-08-30T20:00:00Z",
        },
      ],
      error: null,
    });

    await expect(
      ReviewService.getPublicMasterReviews("master-1")
    ).resolves.toEqual([
      expect.objectContaining({
        gameTitle: "La cripta",
        rating: 5,
      }),
    ]);
    expect(rpc).toHaveBeenCalledWith("get_public_master_reviews", {
      p_master_id: "master-1",
      p_limit: 20,
      p_offset: 0,
    });
  });
});
