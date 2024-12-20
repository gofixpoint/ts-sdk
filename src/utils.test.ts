import { expect, describe, it } from "@jest/globals";

import { joinPaths } from "./utils";

describe("joinPaths", () => {
  it("joins simple paths correctly", () => {
    expect(joinPaths(["a", "b", "c"])).toBe("a/b/c");
  });

  it("handles paths with leading slashes", () => {
    expect(joinPaths(["a", "/b", "/c"])).toBe("a/b/c");
  });

  it("handles paths with trailing slashes", () => {
    expect(joinPaths(["a/", "b/", "c"])).toBe("a/b/c");
  });

  it("handles paths with both leading and trailing slashes", () => {
    expect(joinPaths(["a/", "/b/", "/c"])).toBe("a/b/c");
  });

  it("preserves leading slash of first path", () => {
    expect(joinPaths(["/a", "b", "c"])).toBe("/a/b/c");
  });

  it("preserves trailing slash of last path", () => {
    expect(joinPaths(["a", "b", "c/"])).toBe("a/b/c/");
  });

  it("handles empty paths array", () => {
    expect(joinPaths([])).toBe("");
  });

  it("handles single path", () => {
    expect(joinPaths(["path"])).toBe("path");
  });
});
