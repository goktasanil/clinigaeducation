import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public social sharing image", () => {
  it("serves a complete PNG with the dimensions advertised in page metadata", () => {
    const image = readFileSync(new URL("../../public/og-cover.png", import.meta.url));

    // A base64 string saved with a .png extension is not a usable social preview.
    expect(image.subarray(0, 8)).toEqual(Buffer.from("89504e470d0a1a0a", "hex"));
    expect(image.toString("ascii", 12, 16)).toBe("IHDR");
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
    expect(image.subarray(-12)).toEqual(Buffer.from("0000000049454e44ae426082", "hex"));
  });
});
