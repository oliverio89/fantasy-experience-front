import { describe, expect, it } from "vitest";
import { getErrorMessage } from "../errors";

describe("getErrorMessage", () => {
  it("reads native errors", () => {
    expect(getErrorMessage(new Error("fallo"))).toBe("fallo");
  });

  it("reads API-shaped errors", () => {
    expect(getErrorMessage({ message: "fallo remoto" })).toBe("fallo remoto");
  });

  it("uses the fallback for unknown values", () => {
    expect(getErrorMessage(null, "desconocido")).toBe("desconocido");
  });
});
