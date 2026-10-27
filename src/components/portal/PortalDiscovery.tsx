import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpenCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortalCatalogCopy } from "@/components/portal/portal-catalog-copy";
import {
  formatPortalDiscoveryCopy,
  usePortalDiscoveryCopy,
  type PortalDiscoveryCopy,
} from "@/components/portal/portal-discovery-copy";
import { getCountries } from "@/data/portal";
import { getVerifiedPrograms } from "@/data/verified-education-catalog";
import { supabase } from "@/integrations/supabase/client";
import { searchGlobalCities, searchGlobalInstitutions } from "@/lib/global-catalog.functions";
import {
  type CatalogInstitution,
  type CatalogProgram,
  mergeVerifiedCatalogPrograms,
  type GlobalCitySearchResult,
  sameCatalogText,
  getStarterCatalogCities,
  getStarterCatalogInstitutions,
  matchesCatalogCity,
  mergeCatalogCities,
  mergeCatalogInstitutions,
  searchGlobalCitiesClient,
  searchGlobalInstitutionsClient,
} from "@/lib/global-catalog-browser";

export {
  PortalCatalogFields,
  type PortalCatalogValue,
} from "@/components/portal/PortalCatalogFields";

export type PortalDiscoverySelection = {
  countryCode: string;
  city: string;
  institutionId: string;
  institutionName: string;
  programName: string;
  latitude: number | null;
  longitude: number | null;
  level: "world" | "country" | "city" | "institution";
  coordinatePrecision?: "city" | "institution";
};

type DiscoveryProps = {
  onSelectionChange?: (selection: PortalDiscoverySelection) => void;
  viewMode?: "grid" | "list";
  resetKey?: number;
};

type InstitutionProgram = CatalogProgram;

type ProgramQuery = PromiseLike<{
  data: InstitutionProgram[] | null;
  error: Error | null;
}> & {
  select: (columns: string) => ProgramQuery;
  in: (column: string, values: string[]) => ProgramQuery;
  eq: (column: string, value: unknown) => ProgramQuery;
  order: (column: string, options: { ascending: boolean }) => ProgramQuery;
  limit: (count: number) => ProgramQuery;
};

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";
const FIELD_CLASS =
  "h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-navy outline-none placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export function PortalDiscovery({
  onSelectionChange,
  viewMode = "grid",
  resetKey = 0,
}: DiscoveryProps = {}) {
  const { i18n } = useTranslation();
  const discoveryCopy = usePortalDiscoveryCopy();
  const d = (key: keyof PortalDiscoveryCopy, values?: Record<string, string | number>) =>
    formatPortalDiscoveryCopy(discoveryCopy, key, values);
  const catalogCopy = usePortalCatalogCopy();
  const locale = i18n.resolvedLanguage || i18n.language || "tr";
  const countries = useMemo(() => getCountries(locale), [locale]);
  const getCities = useServerFn(searchGlobalCities);
  const getInstitutions = useServerFn(searchGlobalInstitutions);
  const [countryCode, setCountryCode] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<CatalogInstitution | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [institutionPage, setInstitutionPage] = useState(1);
  const deferredInstitutionSearch = useDeferredValue(institutionSearch.trim());
  const lastReportedSelection = useRef("");
  const starterCities = useMemo(() => getStarterCatalogCities(countryCode), [countryCode]);
  const starterInstitutions = useMemo(
    () =>
      institutionPage === 1
        ? getStarterCatalogInstitutions(countryCode, selectedCity, deferredInstitutionSearch)
        : [],
    [countryCode, selectedCity, deferredInstitutionSearch, institutionPage],
  );
  const starterPrograms = useMemo(
    () => (selectedInstitution ? getVerifiedPrograms(selectedInstitution) : []),
    [selectedInstitution],
  );

  useEffect(() => {
    setCountryCode("");
    setCitySearch("");
    setSelectedCity("");
    setInstitutionSearch("");
    setSelectedInstitution(null);
    setSelectedProgramId("");
    setInstitutionPage(1);
  }, [resetKey]);

  const citiesQuery = useQuery({
    queryKey: ["global-geographic-cities", countryCode],
    queryFn: async (): Promise<GlobalCitySearchResult> =>
      isStaticHost
        ? searchGlobalCitiesClient({ countryCode })
        : getCities({ data: { countryCode, query: "" } }),
    enabled: countryCode.length === 2,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60_000,
  });

  const institutionsQuery = useQuery({
    queryKey: [
      "global-geographic-institutions",
      countryCode,
      selectedCity,
      deferredInstitutionSearch,
      institutionPage,
    ],
    queryFn: () => {
      const data = {
        countryCode,
        city: selectedCity,
        query: deferredInstitutionSearch,
        page: institutionPage,
      };
      return isStaticHost ? searchGlobalInstitutionsClient(data) : getInstitutions({ data });
    },
    enabled: Boolean(countryCode && selectedCity),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60_000,
  });

  const programsQuery = useQuery({
    queryKey: ["institution-verified-programs", selectedInstitution?.id, countryCode],
    queryFn: async (): Promise<InstitutionProgram[]> => {
      if (!selectedInstitution) return [];
      if (selectedInstitution.source === "official") return starterPrograms;
      const db = supabase as unknown as { from: (table: string) => ProgramQuery };
      // Accept the two canonical representations of this same OpenAlex ID;
      // never substitute research topics or another institution's departments.
      const id = selectedInstitution.id;
      const shortId = id.split("/").pop() || id;
      const { data, error } = await db
        .from("institution_programs")
        .select("id, program_name, degree_level, language, official_url, source_checked_at")
        .in("institution_external_id", [id, shortId])
        .eq("verified", true)
        .eq("country_code", countryCode)
        .order("program_name", { ascending: true })
        .limit(1000);
      if (error && !starterPrograms.length) throw error;
      return mergeVerifiedCatalogPrograms(starterPrograms, data || []);
    },
    enabled: Boolean(selectedInstitution),
    retry: false,
    staleTime: 10 * 60_000,
  });

  const cityOptions = useMemo(
    () => mergeCatalogCities(citiesQuery.data, starterCities).cities,
    [citiesQuery.data, starterCities],
  );
  const institutionOptions = useMemo(
    () => mergeCatalogInstitutions(institutionsQuery.data?.institutions || [], starterInstitutions),
    [institutionsQuery.data?.institutions, starterInstitutions],
  );
  const programs = useMemo(
    () => mergeVerifiedCatalogPrograms(starterPrograms, programsQuery.data || []),
    [starterPrograms, programsQuery.data],
  );
  const selectedProgram = programs.find((program) => program.id === selectedProgramId) || null;
  const cityRecord = cityOptions.find((city) => matchesCatalogCity(city, selectedCity));
  // A representative institution point provides a real, approximate city view.
  // It is not presented as a geocoded department, campus entrance or city centre.
  const cityPoint = institutionOptions.find(
    (institution) =>
      sameCatalogText(institution.city, selectedCity) &&
      institution.latitude !== null &&
      institution.longitude !== null,
  );
  const selection = useMemo<PortalDiscoverySelection>(
    () => ({
      countryCode,
      city: selectedCity,
      institutionId: selectedInstitution?.id || "",
      institutionName: selectedInstitution?.name || "",
      programName: selectedProgram?.program_name || "",
      latitude:
        selectedInstitution?.latitude ?? cityRecord?.latitude ?? cityPoint?.latitude ?? null,
      longitude:
        selectedInstitution?.longitude ?? cityRecord?.longitude ?? cityPoint?.longitude ?? null,
      coordinatePrecision:
        selectedInstitution?.latitude != null && selectedInstitution.longitude != null
          ? selectedInstitution.coordinatePrecision || "city"
          : selectedCity
            ? "city"
            : undefined,
      level: selectedInstitution
        ? "institution"
        : selectedCity
          ? "city"
          : countryCode
            ? "country"
            : "world",
    }),
    [countryCode, selectedCity, selectedInstitution, selectedProgram, cityRecord, cityPoint],
  );

  useEffect(() => {
    const value = JSON.stringify(selection);
    if (value !== lastReportedSelection.current) {
      lastReportedSelection.current = value;
      onSelectionChange?.(selection);
    }
  }, [onSelectionChange, selection]);

  const clearInstitution = () => {
    setInstitutionSearch("");
    setSelectedInstitution(null);
    setSelectedProgramId("");
    setInstitutionPage(1);
  };

  const chooseCountry = (value: string) => {
    setCountryCode(value);
    setCitySearch("");
    setSelectedCity("");
    clearInstitution();
  };

  const chooseCity = (value: string) => {
    setCitySearch(value);
    const match = cityOptions.find((city) => matchesCatalogCity(city, value.trim()));
    const nextCity = match?.name || "";
    if (nextCity !== selectedCity) {
      setSelectedCity(nextCity);
      clearInstitution();
    }
  };

  const chooseInstitution = (value: string) => {
    setInstitutionSearch(value);
    const match = institutionOptions.find((institution) =>
      sameCatalogText(institution.name, value.trim()),
    );
    if (match?.id !== selectedInstitution?.id) {
      setSelectedInstitution(match || null);
      setSelectedProgramId("");
    }
    setInstitutionPage(1);
  };

  const selectionQuery = selectedInstitution
    ? "?" +
      new URLSearchParams({
        country: countryCode,
        institution: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        city: selectedCity,
        ...(selectedProgram ? { program: selectedProgram.program_name } : {}),
      }).toString()
    : "";
  const panelHref = "/portal/panel" + selectionQuery;
  const workspaceHref = "/portal/workspace" + selectionQuery;
  const inspectHref = isStaticHost ? workspaceHref : panelHref;
  const countryName = countries.find((country) => country.code === countryCode)?.name || "";
  const pageCount = Math.max(1, Math.ceil((institutionsQuery.data?.total || 0) / 100));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-navy md:text-2xl">{d("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{d("stepHint")}</p>
        </div>
        <Badge variant="outline" className="border-teal/25 bg-teal/5 text-teal">
          {d("steps")}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="min-w-0 space-y-2 rounded-2xl bg-sky-50 p-3 text-sm font-semibold text-navy">
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-200 text-xs">
              1
            </span>
            {d("country")}
          </span>
          <select
            value={countryCode}
            onChange={(event) => chooseCountry(event.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">{d("countryPlaceholder")}</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label
          htmlFor="portal-city"
          className="min-w-0 space-y-2 rounded-2xl bg-cyan-50 p-3 text-sm font-semibold text-navy"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-200 text-xs">
              2
            </span>
            {d("city")}
          </span>
          <span className="relative block">
            <input
              id="portal-city"
              list="portal-city-options"
              value={citySearch}
              onChange={(event) => chooseCity(event.target.value)}
              onBlur={(event) => chooseCity(event.target.value)}
              placeholder={
                !countryCode
                  ? d("cityBefore")
                  : citiesQuery.isFetching && !cityOptions.length
                    ? d("cityLoading")
                    : d("cityPlaceholder")
              }
              disabled={
                !countryCode ||
                (!cityOptions.length && (citiesQuery.isFetching || citiesQuery.isError))
              }
              maxLength={100}
              autoComplete="off"
              className={FIELD_CLASS}
            />
            {citiesQuery.isFetching && (
              <Loader2 className="absolute end-3 top-4 h-4 w-4 animate-spin text-teal" />
            )}
            <datalist id="portal-city-options">
              {cityOptions.map((city) => (
                <option key={city.name} value={city.name}>
                  {d("institutionCount", { count: city.institutionCount })}
                </option>
              ))}
            </datalist>
          </span>
        </label>

        <label
          htmlFor="portal-institution"
          className="min-w-0 space-y-2 rounded-2xl bg-violet-50 p-3 text-sm font-semibold text-navy"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-200 text-xs">
              3
            </span>
            {d("institution")}
          </span>
          <span className="relative block">
            <input
              id="portal-institution"
              list="portal-institution-options"
              value={institutionSearch}
              onChange={(event) => chooseInstitution(event.target.value)}
              onBlur={(event) => chooseInstitution(event.target.value)}
              placeholder={
                !selectedCity
                  ? d("institutionBefore")
                  : institutionsQuery.isFetching
                    ? d("institutionLoading")
                    : d("institutionPlaceholder")
              }
              disabled={!selectedCity}
              maxLength={200}
              autoComplete="off"
              className={FIELD_CLASS}
            />
            {institutionsQuery.isFetching && (
              <Loader2 className="absolute end-3 top-4 h-4 w-4 animate-spin text-teal" />
            )}
            <datalist id="portal-institution-options">
              {institutionOptions.map((institution) => (
                <option key={institution.id} value={institution.name}>
                  {institution.city}
                </option>
              ))}
            </datalist>
          </span>
        </label>

        <label className="min-w-0 space-y-2 rounded-2xl bg-pink-50 p-3 text-sm font-semibold text-navy">
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-pink-200 text-xs">
              4
            </span>
            {d("program")}
          </span>
          <select
            value={selectedProgramId}
            onChange={(event) => setSelectedProgramId(event.target.value)}
            disabled={
              !selectedInstitution ||
              (programsQuery.isFetching && !programs.length) ||
              !programs.length
            }
            className={FIELD_CLASS}
          >
            <option value="">
              {!selectedInstitution
                ? d("programBefore")
                : programsQuery.isFetching && !programs.length
                  ? d("programLoading")
                  : programs.length
                    ? d("programPlaceholder")
                    : d("programPending")}
            </option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.program_name}
                {program.degree_level ? " · " + program.degree_level : ""}
                {program.language ? " · " + program.language : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      {starterCities.cities.length > 0 && !selectedCity && (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={d("city")}>
          <span className="me-1 text-xs font-medium text-muted-foreground">{d("city")}:</span>
          {starterCities.cities.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => chooseCity(city.name)}
              className="min-h-10 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-teal hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {citiesQuery.isError && !cityOptions.length
            ? d("cityError")
            : citiesQuery.isFetching && !cityOptions.length
              ? d("cityPreparing")
              : countryCode
                ? d("citySuggestions", { count: cityOptions.length })
                : d("description")}
          {selectedCity && (
            <span className="ms-2">
              {institutionsQuery.isError && !institutionOptions.length
                ? d("institutionError")
                : institutionsQuery.isFetching && !institutionOptions.length
                  ? d("institutionsLoading", { city: selectedCity })
                  : d("institutionMatches", {
                      count: Math.max(
                        institutionsQuery.data?.total || 0,
                        institutionOptions.length,
                      ),
                    })}
            </span>
          )}
        </p>
        {selectedInstitution && (
          <Button asChild className="rounded-xl bg-navy text-white hover:bg-navy/90">
            <a href={inspectHref}>
              <Search className="me-2 h-4 w-4" />
              {d("inspect")}
            </a>
          </Button>
        )}
      </div>

      {selectedProgram?.official_url && (
        <a
          href={selectedProgram.official_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          {catalogCopy.officialCatalog}: {selectedProgram.program_name}
          <ExternalLink className="h-4 w-4 shrink-0" />
        </a>
      )}

      {selectedInstitution &&
        !programs.length &&
        (programsQuery.isError || programsQuery.isSuccess) && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-navy">
              {programsQuery.isError
                ? d("programCatalogPending")
                : d("noPrograms", { institution: selectedInstitution.name })}
            </p>
            <p className="mt-2 text-muted-foreground">{catalogCopy.programsOnly}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-5">
              {selectedInstitution.homepageUrl && (
                <a
                  href={selectedInstitution.homepageUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  {catalogCopy.officialCatalog}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <a
                href={isStaticHost ? workspaceHref : "/auth?next=" + encodeURIComponent(panelHref)}
                className="inline-flex min-h-11 items-center font-semibold text-navy underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                {isStaticHost ? d("inspect") : catalogCopy.requestCatalog}
                <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
              </a>
            </div>
          </div>
        )}

      {selectedCity && institutionOptions.length > 0 && !selectedInstitution && (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-semibold text-navy">
              {countryName} · {selectedCity}
            </p>
            <span className="text-muted-foreground">
              {d("institutionsShown", { count: institutionOptions.length })}
            </span>
          </div>
          <div
            className={
              "grid max-h-[420px] gap-3 overflow-y-auto pe-1 " +
              (viewMode === "list" ? "grid-cols-1" : "md:grid-cols-2")
            }
          >
            {institutionOptions.map((institution) => (
              <article
                key={institution.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-teal/50"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white text-teal">
                  {institution.logoUrl ? (
                    <img
                      src={institution.logoUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug text-navy">{institution.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {[institution.city, institution.region, institution.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setInstitutionSearch(institution.name);
                        setSelectedInstitution(institution);
                        setSelectedProgramId("");
                      }}
                      className="min-h-10 text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                    >
                      {d("selectInstitution")}
                    </button>
                    {institution.homepageUrl && (
                      <a
                        href={institution.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex min-h-10 items-center gap-1 text-xs text-muted-foreground hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                      >
                        {d("officialSite")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {pageCount > 1 && (
            <nav className="mt-4 flex items-center justify-end gap-3" aria-label={d("institution")}>
              <Button
                variant="outline"
                size="sm"
                disabled={institutionPage <= 1 || institutionsQuery.isFetching}
                onClick={() => setInstitutionPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                {d("previous")}
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {institutionPage} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={institutionPage >= pageCount || institutionsQuery.isFetching}
                onClick={() => setInstitutionPage((page) => page + 1)}
              >
                {d("next")}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </nav>
          )}
        </div>
      )}

      {(citiesQuery.isError || institutionsQuery.isError) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => {
            if (citiesQuery.isError) void citiesQuery.refetch();
            else void institutionsQuery.refetch();
          }}
        >
          {d("retry")}
        </Button>
      )}
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{d("coverageNote")}</p>
      <p className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-muted-foreground">
        <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
        {d("dataNote")}
      </p>
    </div>
  );
}
