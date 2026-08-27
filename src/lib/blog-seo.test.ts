import { describe, expect, it } from "vitest";

import { blogRobotsContent } from "./blog-seo";

describe("blogRobotsContent", () => {
  it("keeps published posts indexable", () => {
    expect(blogRobotsContent(true)).toBe("index, follow");
  });

  it("prevents missing legacy posts from being indexed", () => {
    expect(blogRobotsContent(false)).toBe("noindex, follow");
  });
});
