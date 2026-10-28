const INTENT_SERVICE_INDEX = {
  abroad: 0,
  university: 0,
  visa: 1,
  thesis: 2,
  stats: 3,
  documents: 4,
  career: 5,
  publication: 5,
  kpss: 5,
  mentorship: 5,
} as const;

const PACKAGE_SERVICE_INDEX = {
  hourly: 5,
  bachelor: 0,
  master: 0,
  phd: 0,
  thesis: 2,
  stats: 3,
} as const;

export type ContactSearch = {
  intent?: keyof typeof INTENT_SERVICE_INDEX;
  package?: keyof typeof PACKAGE_SERVICE_INDEX;
};

export function validateContactSearch(search: Record<string, unknown>): ContactSearch {
  return {
    ...(typeof search.intent === "string" && Object.hasOwn(INTENT_SERVICE_INDEX, search.intent)
      ? { intent: search.intent as ContactSearch["intent"] }
      : {}),
    ...(typeof search.package === "string" && Object.hasOwn(PACKAGE_SERVICE_INDEX, search.package)
      ? { package: search.package as ContactSearch["package"] }
      : {}),
  };
}

export function contactPrefillService(
  search: ContactSearch,
  services: readonly string[],
): string | null {
  const index = search.package
    ? PACKAGE_SERVICE_INDEX[search.package]
    : search.intent
      ? INTENT_SERVICE_INDEX[search.intent]
      : undefined;
  return index === undefined ? null : (services[index] ?? null);
}
