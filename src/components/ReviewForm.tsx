import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "../i18n";
import { useToast } from "../context/ToastContext";
import ReviewService from "../services/reviewService";

interface ReviewFormProps {
  partidaId: string;
  masterId: string;
}

const ReviewForm = ({ partidaId, masterId }: ReviewFormProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    let active = true;
    ReviewService.getMyReview(partidaId)
      .then((review) => {
        if (!active || !review) return;
        setRating(review.rating);
        setComment(review.comment);
        setHasReview(true);
      })
      .catch(() => {
        if (active) showToast(t.detailsGame.reviewLoadError, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [partidaId, showToast, t]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await ReviewService.saveReview({ partidaId, masterId, rating, comment });
      setHasReview(true);
      showToast(t.detailsGame.reviewSaved, "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t.detailsGame.reviewSaveError,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[54.5rem] flex flex-col gap-4 border border-dark-gold rounded-xl p-6"
    >
      <h2 className="text-2xl text-nude font-radio-option">
        {hasReview
          ? t.detailsGame.editReviewTitle
          : t.detailsGame.reviewTitle}
      </h2>
      <label className="flex flex-col gap-2 text-nude font-radio-option">
        {t.detailsGame.ratingLabel}
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="rounded-lg px-3 py-2 text-black"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} / 5
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-nude font-radio-option">
        {t.detailsGame.reviewCommentLabel}
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          minLength={10}
          maxLength={1000}
          required
          rows={4}
          className="rounded-lg px-3 py-2 text-black"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-full bg-dark-gold px-8 py-2 text-black font-bold disabled:opacity-50"
      >
        {saving ? t.detailsGame.reviewSaving : t.detailsGame.reviewSubmit}
      </button>
    </form>
  );
};

export default ReviewForm;
