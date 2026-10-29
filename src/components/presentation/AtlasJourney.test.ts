import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import i18n, { LANGUAGES, setLanguage } from "@/i18n";
import { PortalTeaser } from "@/components/sections/PortalTeaser";
import { AtlasJourney } from "./AtlasJourney";
import { StudyAtlas } from "./StudyAtlas";
import { atlasCopy } from "./atlas-copy";

afterEach(async () => {
  await setLanguage("tr");
});

describe("ScrollCraft progressive enhancement", () => {
  it.each(LANGUAGES)(
    "keeps the process and a real country destination available without JavaScript in $code",
    async ({ code }) => {
      await setLanguage(code);
      const markup = renderToStaticMarkup(
        createElement(StudyAtlas, null, [
          createElement(AtlasJourney, { key: "journey" }),
          createElement(PortalTeaser, { key: "portal" }),
        ]),
      );
      const steps = i18n.t("process.steps", { returnObjects: true }) as {
        title: string;
        desc: string;
      }[];
      expect(markup).toContain('data-motion="paused"');
      expect(markup.match(/aria-current="step"/g)).toHaveLength(1);
      for (const step of steps) {
        const escapedTitle = renderToStaticMarkup(createElement("span", null, step.title)).slice(
          6,
          -7,
        );
        const escapedDescription = renderToStaticMarkup(
          createElement("span", null, step.desc),
        ).slice(6, -7);
        expect(markup).toContain(escapedTitle);
        expect(markup).toContain(escapedDescription);
      }
      expect(markup).toContain(`href="/${code === "pt" ? "en" : code}/blog?country=IT"`);
      expect(markup).toContain('href="/portal"');
      expect(markup).toContain('href="/iletisim#randevu"');
      expect(markup).toContain(atlasCopy(code).roadmap);
      expect(markup).not.toContain("[object Object]");
    },
  );
});
