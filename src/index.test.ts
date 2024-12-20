import { version } from "./index";

describe("version check", () => {
  test("version is correct", () => {
    expect(version).toBe("0.1.0");
  });
});
