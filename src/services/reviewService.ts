import { supabase } from "../lib/supabase";

const REVIEW_COLUMNS =
  "id,partida_id,master_id,player_id,rating,comment,created_at" as const;

export interface MasterReview {
  id: string;
  partidaId: string;
  masterId: string;
  playerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PublicMasterReview {
  id: string;
  partidaId: string;
  gameTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const mapReview = (row: {
  id: string;
  partida_id: string | null;
  master_id: string;
  player_id: string;
  rating: number;
  comment: string;
  created_at: string;
}): MasterReview => ({
  id: row.id,
  partidaId: row.partida_id ?? "",
  masterId: row.master_id,
  playerId: row.player_id,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at,
});

export class ReviewService {
  static async getPublicMasterReviews(
    masterId: string,
    limit = 20
  ): Promise<PublicMasterReview[]> {
    const safeLimit = Math.min(Math.max(Math.round(limit), 1), 50);
    const { data, error } = await supabase.rpc("get_public_master_reviews", {
      p_master_id: masterId,
      p_limit: safeLimit,
      p_offset: 0,
    });
    if (error) throw new Error(error.message);
    return (data || []).map((review) => ({
      id: review.id,
      partidaId: review.partida_id,
      gameTitle: review.game_title,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
    }));
  }

  static async getMyReview(partidaId: string): Promise<MasterReview | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("master_reviews")
      .select(REVIEW_COLUMNS)
      .eq("partida_id", partidaId)
      .eq("player_id", user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapReview(data) : null;
  }

  static async saveReview(input: {
    partidaId: string;
    masterId: string;
    rating: number;
    comment: string;
  }): Promise<MasterReview> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Debes iniciar sesión para publicar una reseña");

    const rating = Math.round(input.rating);
    const comment = input.comment.trim();
    if (rating < 1 || rating > 5) {
      throw new Error("La valoración debe estar entre 1 y 5");
    }
    if (comment.length < 10 || comment.length > 1000) {
      throw new Error("El comentario debe tener entre 10 y 1000 caracteres");
    }

    const existing = await this.getMyReview(input.partidaId);
    if (existing) {
      const { data, error } = await supabase
        .from("master_reviews")
        .update({ rating, comment })
        .eq("id", existing.id)
        .eq("player_id", user.id)
        .select(REVIEW_COLUMNS)
        .single();

      if (error) throw new Error(error.message);
      return mapReview(data);
    }

    const { data, error } = await supabase
      .from("master_reviews")
      .insert({
        partida_id: input.partidaId,
        master_id: input.masterId,
        player_id: user.id,
        rating,
        comment,
      })
      .select(REVIEW_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return mapReview(data);
  }
}

export default ReviewService;
