import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpenCheck,
  Building2,
  ChevronRight,
  Globe2,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCountries } from "@/data/portal";
import { supabase } from "@/integrations/supabase/client";
import { searchGlobalCities, searchGlobalInstitutions } from "@/lib/global-catalog.functions";
import {
  type GlobalCitySearchResult,
  searchGlobalCitiesClient,
  searchGlobalInstitutionsClient,
} from "@/lib/global-catalog-browser";

export {
  PortalCatalogFields,
  type PortalCatalogValue,
} from "@/components/portal/PortalCatalogFields";

type Institution = {
  id: string;
  name: string;
  type: string;
  city: string;
  region: string;
  country: string;
  homepageUrl: string | null;
  logoUrl: string | null;
  worksCount: number;
  source: "openalex" | "ror";
};

type InstitutionProgram = {
  id: string;
  program_name: string;
  degree_level: string | null;
  language: string | null;
  official_url: string | null;
};

const POPULAR_DESTINATIONS = [
  { countryCode: "DE", city: "Berlin", label: "Berlin" },
  { countryCode: "IT", city: "Milano", label: "Milano" },
  { countryCode: "GB", city: "London", label: "Londra" },
  { countryCode: "NL", city: "Amsterdam", label: "Amsterdam" },
  { countryCode: "CA", city: "Toronto", label: "Toronto" },
  { countryCode: "US", city: "Boston", label: "Boston" },
] as const;

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

function sameText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "base" }) === 0;
}

export function PortalDiscovery() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "tr";
  const countries = useMemo(() => getCountries(locale), [locale]);
  const getCities = useServerFn(searchGlobalCities);
  const getInstitutions = useServerFn(searchGlobalInstitutions);
  const [countryCode, setCountryCode] = useState("DE");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const deferredCitySearch = useDeferredValue(citySearch.trim());
  const deferredInstitutionSearch = useDeferredValue(institutionSearch.trim());
  const selectedCountryName =
    countries.find((country) => country.code === countryCode)?.name || countryCode;

  const citiesQuery = useQuery({
    queryKey: ["global-cities", countryCode, deferredCitySearch],
    queryFn: async (): Promise<GlobalCitySearchResult> =>
      isStaticHost
        ? searchGlobalCitiesClient({ countryCode, query: deferredCitySearch })
        : await getCities({ data: { countryCode, query: deferredCitySearch } }),
    enabled: deferredCitySearch.length >= 2,
    staleTime: 10 * 60_000,
  });

  const institutionsQuery = useQuery({
    queryKey: ["global-institutions", countryCode, selectedCity, deferredInstitutionSearch],
    queryFn: () => {
      const data = {
        countryCode,
        city: selectedCity,
        query: deferredInstitutionSearch,
        page: 1,
      };
      return isStaticHost ? searchGlobalInstitutionsClient(data) : getInstitutions({ data });
    },
    enabled: Boolean(selectedCity),
    staleTime: 10 * 60_000,
  });

  const programsQuery = useQuery({
    queryKey: ["institution-programs", selectedInstitution?.id],
    queryFn: async (): Promise<InstitutionProgram[]> => {
      if (!selectedInstitution) return [];
      // institution_programs is provisioned outside the generated Supabase
      // types, so the query builder is reached through an untyped view.
      const untypedDb = supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (
              column: string,
              value: unknown,
            ) => {
              eq: (
                column: string,
                value: unknown,
              ) => {
                order: (
                  column: string,
                  options: { ascending: boolean },
                ) => {
                  limit: (
                    count: number,
                  ) => Promise<{ data: InstitutionProgram[] | null; error: Error | null }>;
                };
              };
            };
          };
        };
      };
      const { data, error } = await untypedDb
        .from("institution_programs")
        .select("id, program_name, degree_level, language, official_url")
        .eq("institution_external_id", selectedInstitution.id)
        .eq("verified", true)
        .order("program_name", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(selectedInstitution),
    retry: false,
    staleTime: 10 * 60_000,
  });

  const cityOptions = useMemo(() => citiesQuery.data?.cities || [], [citiesQuery.data?.cities]);
  const institutionOptions = ((institutionsQuery.data?.institutions || []) as Institution[]).filter(
    (institution) => institution.type.toLocaleLowerCase("en") === "education",
  );
  const programs = programsQuery.data || [];
  const selectedProgram = programs.find((program) => program.id === selectedProgramId) || null;

  useEffect(() => {
    const match = cityOptions.find((city) => sameText(city.name, citySearch.trim()));
    if (match && !sameText(selectedCity, match.name)) setSelectedCity(match.name);
  }, [cityOptions, citySearch, selectedCity]);

  const chooseCity = (value: string) => {
    setCitySearch(value);
    const match = cityOptions.find((city) => sameText(city.name, value));
    setSelectedCity(match?.name || "");
    setInstitutionSearch("");
    setSelectedInstitution(null);
    setSelectedProgramId("");
  };

  const chooseInstitution = (value: string) => {
    setInstitutionSearch(value);
    const match = institutionOptions.find((institution) => sameText(institution.name, value));
    setSelectedInstitution(match || null);
    setSelectedProgramId("");
  };

  const panelHref = selectedInstitution
    ? "/portal/panel?country=" +
      encodeURIComponent(countryCode) +
      "&institution=" +
      encodeURIComponent(selectedInstitution.id) +
      "&institutionName=" +
      encodeURIComponent(selectedInstitution.name) +
      "&city=" +
      encodeURIComponent(selectedCity) +
      (selectedProgram ? "&program=" + encodeURIComponent(selectedProgram.program_name) : "")
    : "/portal/panel";

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-navy p-5 text-white shadow-2xl shadow-navy/30 md:p-8">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal/25 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge className="mb-3 border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Globe2 className="mr-1.5 h-3.5 w-3.5 text-gold" />
              {t("portalDiscovery.badge")}
            </Badge>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              {t("portalDiscovery.title")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
              {t("portalDiscovery.description")}
            </p>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-right md:block">
            <div className="text-2xl font-semibold text-gold">{t("portalDiscovery.steps")}</div>
            <div className="text-xs text-white/60">{t("portalDiscovery.stepHint")}</div>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 rounded-2xl border border-sky-300/25 bg-sky-300/10 p-3 text-xs font-semibold uppercase tracking-wider text-sky-100">
            {t("portalDiscovery.country")}
            <select
              value={countryCode}
              onChange={(event) => {
                setCountryCode(event.target.value);
                setCitySearch("");
                setSelectedCity("");
                setInstitutionSearch("");
                setSelectedInstitution(null);
                setSelectedProgramId("");
              }}
              className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none ring-gold/60 focus:ring-2"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <label
            htmlFor="portal-city"
            className="space-y-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-xs font-semibold uppercase tracking-wider text-cyan-100"
          >
            {t("portalDiscovery.city")}
            <div className="relative">
              <input
                id="portal-city"
                list="portal-city-options"
                value={citySearch}
                onChange={(event) => chooseCity(event.target.value)}
                onBlur={(event) => chooseCity(event.target.value)}
                placeholder={
                  citiesQuery.isLoading
                    ? t("portalDiscovery.cityLoading")
                    : t("portalDiscovery.cityPlaceholder")
                }
                maxLength={100}
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none ring-gold/60 focus:ring-2"
              />
              {citiesQuery.isLoading && (
                <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-teal" />
              )}
              <datalist id="portal-city-options">
                {cityOptions.map((city) => (
                  <option key={city.geonameId || city.name} value={city.name}>
                    {city.institutionCount
                      ? t("portalDiscovery.institutionCount", {
                          count: city.institutionCount,
                        })
                      : city.population
                        ? t("portalDiscovery.population", {
                            count: city.population.toLocaleString(locale),
                          })
                        : ""}
                  </option>
                ))}
              </datalist>
            </div>
          </label>

          <label
            htmlFor="portal-institution"
            className="space-y-2 rounded-2xl border border-violet-300/25 bg-violet-300/10 p-3 text-xs font-semibold uppercase tracking-wider text-violet-100"
          >
            {t("portalDiscovery.institution")}
            <div className="relative">
              <input
                id="portal-institution"
                list="portal-institution-options"
                value={institutionSearch}
                onChange={(event) => chooseInstitution(event.target.value)}
                onBlur={(event) => chooseInstitution(event.target.value)}
                placeholder={
                  !selectedCity
                    ? t("portalDiscovery.institutionBefore")
                    : institutionsQuery.isLoading
                      ? t("portalDiscovery.institutionLoading")
                      : t("portalDiscovery.institutionPlaceholder")
                }
                disabled={!selectedCity}
                maxLength={100}
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none placeholder:text-slate-400 ring-gold/60 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-200"
              />
              {institutionsQuery.isLoading && (
                <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-teal" />
              )}
              <datalist id="portal-institution-options">
                {institutionOptions.map((institution) => (
                  <option key={institution.id} value={institution.name}>
                    {[institution.city, institution.type].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </datalist>
            </div>
          </label>

          <label className="space-y-2 rounded-2xl border border-pink-300/25 bg-pink-300/10 p-3 text-xs font-semibold uppercase tracking-wider text-pink-100">
            {t("portalDiscovery.program")}
            <select
              value={selectedProgramId}
              onChange={(event) => setSelectedProgramId(event.target.value)}
              disabled={!selectedInstitution || programsQuery.isLoading || programs.length === 0}
              className="h-12 w-full rounded-xl border border-white/15 bg-white px-3 text-sm font-medium text-navy outline-none ring-gold/60 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-200"
            >
              <option value="">
                {!selectedInstitution
                  ? t("portalDiscovery.programBefore")
                  : programsQuery.isLoading
                    ? t("portalDiscovery.programLoading")
                    : programs.length
                      ? t("portalDiscovery.programPlaceholder")
                      : t("portalDiscovery.programPending")}
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.program_name}
                  {program.degree_level ? " · " + program.degree_level : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end rounded-2xl border border-white/10 bg-white/[0.06] p-3">
            <Button
              asChild={Boolean(selectedInstitution)}
              disabled={!selectedInstitution}
              className="h-12 w-full rounded-xl bg-gold text-gold-foreground shadow-lg shadow-gold/20 hover:bg-gold/90"
            >
              {selectedInstitution ? (
                <a href={panelHref}>
                  <Search className="mr-2 h-4 w-4" /> {t("portalDiscovery.inspect")}
                </a>
              ) : (
                <span>
                  <Search className="mr-2 h-4 w-4" /> {t("portalDiscovery.inspect")}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div
          className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55"
          aria-live="polite"
        >
          <span>
            {deferredCitySearch.length < 2
              ? "Şehirleri aramak için en az 2 harf yazın."
              : citiesQuery.isLoading
                ? t("portalDiscovery.cityPreparing")
                : citiesQuery.isError
                  ? t("portalDiscovery.cityError")
                  : t("portalDiscovery.citySuggestions", { count: cityOptions.length })}
          </span>
          {selectedCity && (
            <span>
              {institutionsQuery.isLoading
                ? t("portalDiscovery.institutionsLoading", { city: selectedCity })
                : institutionsQuery.isError
                  ? t("portalDiscovery.institutionError")
                  : t("portalDiscovery.institutionMatches", {
                      count: institutionsQuery.data?.total || institutionOptions.length,
                    })}
            </span>
          )}
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label={t("portalDiscovery.popularAria")}
        >
          <span className="mr-1 text-xs font-medium text-white/55">
            {t("portalDiscovery.popular")}:
          </span>
          {POPULAR_DESTINATIONS.map((destination) => {
            const active =
              destination.countryCode === countryCode && destination.city === selectedCity;
            return (
              <button
                key={destination.label}
                type="button"
                onClick={() => {
                  setCountryCode(destination.countryCode);
                  setCitySearch(destination.city);
                  setSelectedCity(destination.city);
                  setInstitutionSearch("");
                  setSelectedInstitution(null);
                  setSelectedProgramId("");
                }}
                className={
                  "min-h-10 rounded-full border px-3 py-2 text-xs font-medium transition " +
                  (active
                    ? "border-gold bg-gold text-gold-foreground"
                    : "border-white/15 bg-white/[0.06] text-white/75 hover:border-teal/70 hover:bg-white/10 hover:text-white")
                }
              >
                {destination.label}
              </button>
            );
          })}
        </div>

        {selectedInstitution && programsQuery.isError && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold"
          >
            {t("portalDiscovery.programCatalogPending")}
          </p>
        )}

        {selectedInstitution && programsQuery.isSuccess && programs.length === 0 && (
          <div className="mt-4 rounded-xl border border-white/15 bg-white/[0.07] p-4 text-sm text-white/75">
            <p className="font-medium text-white">
              {t("portalDiscovery.noPrograms", { institution: selectedInstitution.name })}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              {t("portalDiscovery.noProgramsDescription")}
              {selectedInstitution.homepageUrl && ` ${t("portalDiscovery.verifyOfficial")}`}
            </p>
            {selectedInstitution.homepageUrl && (
              <a
                href={selectedInstitution.homepageUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-3 inline-flex min-h-11 items-center font-semibold text-gold hover:underline"
              >
                {t("portalDiscovery.openOfficialPrograms")}{" "}
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            )}
            <a
              href={"/auth?next=" + encodeURIComponent(panelHref)}
              className="ml-4 inline-flex min-h-11 items-center font-semibold text-teal hover:text-gold"
            >
              Gerçek bölüm kataloğunu ekleme talebi gönder
            </a>
          </div>
        )}

        {institutionOptions.length > 0 && !selectedInstitution && (
          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-white">
              {selectedCountryName} · {selectedCity}
              <span className="ml-2 font-normal text-white/55">
                {t("portalDiscovery.institutionsShown", {
                  count: institutionOptions.length,
                })}
              </span>
            </p>
            <div
              className="grid max-h-[480px] gap-3 overflow-y-auto pr-1 md:grid-cols-2"
              aria-live="polite"
            >
              {institutionOptions.map((institution) => (
                <article
                  key={institution.id}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4 transition hover:-translate-y-0.5 hover:border-teal/60 hover:bg-white/[0.12]"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-navy">
                    {institution.logoUrl ? (
                      <img
                        src={institution.logoUrl}
                        alt=""
                        className="h-full w-full object-contain p-1.5"
                        loading="lazy"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-teal" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-snug">{institution.name}</h3>
                      <Badge className="shrink-0 border-white/15 bg-white/10 text-[10px] text-white hover:bg-white/10">
                        {institution.type}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/60">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                      {[institution.city, institution.region, institution.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setInstitutionSearch(institution.name);
                          setSelectedInstitution(institution);
                          setSelectedProgramId("");
                        }}
                        className="min-h-10 font-medium text-gold hover:underline"
                      >
                        {t("portalDiscovery.selectInstitution")}
                      </button>
                      {institution.homepageUrl && (
                        <a
                          href={institution.homepageUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex min-h-10 items-center text-white/70 hover:text-white"
                        >
                          {t("portalDiscovery.officialSite")}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/50">
          <BookOpenCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
          {t("portalDiscovery.dataNote")}
        </p>
      </div>
    </div>
  );
}
