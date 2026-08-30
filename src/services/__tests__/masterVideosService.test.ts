import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/supabase", () => ({ supabase: {} }));

import {
  extractYoutubeId,
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
} from "../masterVideosService";

describe("YouTube video URLs", () => {
  it("normalizes supported YouTube URL formats", () => {
    expect(
      extractYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBe("dQw4w9WgXcQ");
    expect(extractYoutubeId("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe(
      "dQw4w9WgXcQ"
    );
    expect(
      getYoutubeEmbedUrl("https://youtube.com/shorts/dQw4w9WgXcQ")
    ).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
    );
  });

  it("rejects arbitrary or malformed iframe sources", () => {
    expect(extractYoutubeId("https://example.com/dQw4w9WgXcQ")).toBeNull();
    expect(extractYoutubeId("javascript:alert(1)")).toBeNull();
    expect(getYoutubeEmbedUrl("https://example.com/video")).toBe("");
    expect(getYoutubeThumbnail("invalid")).toBe("");
  });
});
