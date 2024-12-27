import { expect, describe, it } from "@jest/globals";
import { errorSchema } from "./errors";

describe("errorSchema", () => {
  it("should parse a string", () => {
    const result = errorSchema.safeParse({ detail: "hello" });
    expect(result.success).toBe(true);
    expect(result.data?.detail).toBe("hello");
  });
});
