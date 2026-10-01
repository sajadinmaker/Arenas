import { describe, expect, it } from "vitest";
import { HealthResponseSchema } from "../src/health.js";

describe("health schema (zod boundary)", () => {
  it("accepts a valid health payload", () => {
    const parsed = HealthResponseSchema.parse({
      ok: true,
      service: "arenas",
      version: "0.1.0",
    });
    expect(parsed.ok).toBe(true);
  });

  it("rejects an invalid payload", () => {
    expect(() =>
      HealthResponseSchema.parse({ ok: true, service: "wrong" }),
    ).toThrow();
  });
});
