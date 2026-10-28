import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { LANGUAGES, setLanguage } from "@/i18n";
import i18n from "@/i18n";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { journeyProgress, journeyStep } from "./presentation-motion";

afterEach(async () => {
  await setLanguage("tr");
});

describe("cinematic journey", () => {
  it("clamps scroll progress at the sticky scene boundaries", () => {
    expect(journeyProgress(900, 2400, 800)).toBe(0);
    expect(journeyProgress(76, 2400, 800)).toBe(0);
    expect(journeyProgress(-724, 2400, 800)).toBe(0.5);
    expect(journeyProgress(-3000, 2400, 800)).toBe(1);
    expect(journeyProgress(0, 600, 800)).toBe(0);
    expect([0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => journeyStep(p, 5))).toEqual([0, 1, 2, 3, 4, 4]);
  });

  it.each(LANGUAGES)(
    "keeps all five steps readable before JavaScript in $code",
    async ({ code }) => {
      await setLanguage(code);
      const markup = renderToStaticMarkup(createElement(ProcessTimeline));
      const steps = i18n.t("process.steps", { returnObjects: true }) as {
        title: string;
        desc: string;
      }[];
      expect(markup).toContain('data-motion="paused"');
      expect(markup.match(/class="cinema-step"/g)).toHaveLength(5);
      for (const step of steps) {
        expect(markup).toContain(step.title);
        expect(markup).toContain(step.desc.replaceAll("'", "&#x27;"));
      }
      expect(markup).toContain('href="/iletisim#randevu"');
    },
  );
});
