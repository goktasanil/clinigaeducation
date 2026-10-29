import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RouteExperience } from "./PageExperience";
import { isTaskPage, pageKind, serviceMatches } from "./page-experience";
import { SERVICES } from "@/data/services";
import "@/i18n";

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory()
      ? routeFiles(join(directory, item.name))
      : item.name.endsWith(".tsx")
        ? [join(directory, item.name)]
        : [],
  );
}

describe("site-wide page experience", () => {
  it("covers every rendered route, including authenticated and localized families", () => {
    const paths = routeFiles("src/routes").flatMap((file) => {
      const source = readFileSync(file, "utf8");
      if (!source.includes("component:")) return [];
      const route = source.match(/createFileRoute\("([^"]+)"\)/)?.[1];
      return route
        ? [
            route
              .replace("/_authenticated", "")
              .replaceAll("_", "")
              .replace("$language", "ar")
              .replace("$slug", "sample"),
          ]
        : [];
    });
    expect(paths.length).toBeGreaterThan(20);
    for (const path of paths) expect(pageKind(path), path).not.toBe("page");
    expect(pageKind("/ar/blog/archive/sample")).toBe("article");
    expect(pageKind("/portal/workspace")).toBe("workspace");
    expect(pageKind("/portal/checkout")).toBe("account");
  });

  it.each([
    "/hizmetler",
    "/paketler",
    "/hakkimizda",
    "/iletisim",
    "/surec",
    "/quiz",
    "/sehir-rehberleri",
    "/sehir-rehberleri/roma",
    "/gizlilik",
    "/auth",
    "/portal",
    "/portal/workspace",
    "/tr/blog",
    "/ar/blog/archive/example",
  ])("keeps complete content and one H1 before JavaScript on %s", (path) => {
    const html = renderToStaticMarkup(
      createElement(RouteExperience, {
        pathname: path,
        children: createElement("div", null, [
          createElement("h1", { key: "h" }, "Existing page"),
          createElement("a", { key: "a", href: "/iletisim#randevu" }, "Existing action"),
        ]),
      }),
    );
    expect(html).toContain(`data-page-kind="${pageKind(path)}"`);
    expect(html).toContain('data-motion="paused"');
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain('href="/iletisim#randevu"');
    expect(html).not.toContain("data-sc-ready");
    expect(html).not.toContain("education-chapter-");
  });

  it("leaves the homepage's independent atlas surface intact", () => {
    const html = renderToStaticMarkup(
      createElement(RouteExperience, {
        pathname: "/",
        children: createElement("h1", null, "Homepage"),
      }),
    );
    expect(html).toBe("<h1>Homepage</h1>");
  });
  it("renders Arabic reading controls in Arabic before client language effects", () => {
    const html = renderToStaticMarkup(
      createElement(RouteExperience, {
        pathname: "/ar/blog/italy-admission",
        children: createElement("h1", null, "دليل"),
      }),
    );
    expect(html).toContain('aria-label="في هذه الصفحة"');
    expect(html).toContain('aria-label="العودة إلى الأعلى"');
  });

  it("does not extract chapter navigation from account, form, quiz or workspace screens", () => {
    for (const path of [
      "/auth",
      "/portal/workspace",
      "/portal/verify",
      "/quiz",
      "/iletisim",
      "/admin/leads",
    ])
      expect(isTaskPage(pageKind(path))).toBe(true);
    expect(isTaskPage(pageKind("/gizlilik"))).toBe(false);
  });

  it("partitions all six real services without losing or duplicating a service", () => {
    const groups = ["application", "research"].map((filter) =>
      SERVICES.filter(({ key }) => serviceMatches(key, filter)).map(({ key }) => key),
    );
    expect(groups[0]).toEqual(["education", "visa", "documents"]);
    expect(groups[1]).toEqual(["thesis", "statistics", "publication"]);
    expect(new Set(groups.flat()).size).toBe(SERVICES.length);
    expect(SERVICES.every(({ key }) => serviceMatches(key, "all"))).toBe(true);
  });
});
