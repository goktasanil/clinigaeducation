import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { Route } from "@/routes/iletisim";

const searchState = vi.hoisted(() => ({ value: {} as Record<string, string> }));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options, useSearch: () => searchState.value }),
  Link: ({ to, children }: { to: string; children: ReactNode }) =>
    createElement("a", { href: to }, children),
}));

vi.mock("@/components/contact/AppointmentPicker", () => ({
  AppointmentPicker: () => createElement("div", null, "Appointment selection"),
}));

vi.mock("@/components/contact/ContactForm", () => ({
  ContactForm: ({
    prefillIntent,
    prefillContext,
  }: {
    prefillIntent?: string;
    prefillContext?: string;
  }) => createElement("div", { "data-service": prefillIntent, "data-context": prefillContext }),
}));

function initialHtml(search: Record<string, string>) {
  searchState.value = search;
  return renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n },
      createElement(Route.options.component as ComponentType),
    ),
  );
}

describe("contact-page static hydration", () => {
  it("starts package URLs with the same HTML as the queryless page served by GitHub Pages", () => {
    const baseline = initialHtml({});
    for (const key of ["hourly", "bachelor", "master", "phd", "thesis", "stats"]) {
      expect(initialHtml({ package: key })).toBe(baseline);
    }
  });

  it("also defers intent-specific form defaults until after hydration", () => {
    const baseline = initialHtml({});
    for (const intent of ["abroad", "visa", "documents", "thesis", "stats", "publication"]) {
      expect(initialHtml({ intent })).toBe(baseline);
    }
  });
});
