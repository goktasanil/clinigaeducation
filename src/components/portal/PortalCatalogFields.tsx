/* eslint-disable @typescript-eslint/no-explicit-any -- Catalogue tables are newer than generated Supabase types. */
import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getCountries } from "@/data/portal";
import { getVerifiedPrograms } from "@/data/verified-education-catalog";
import { getPortalDiscoveryCopy } from "@/components/portal/portal-discovery-copy";
import { supabase } from "@/integrations/supabase/client";
import { usePortalCatalogCopy } from "@/components/portal/portal-catalog-copy";
import { searchGlobalCities, searchGlobalInstitutions } from "@/lib/global-catalog.functions";
import {
  type GlobalCitySearchResult,
  getStarterCatalogCities,
  getStarterCatalogInstitutions,
  matchesCatalogCity,
  mergeCatalogCities,
  mergeCatalogInstitutions,
  mergeVerifiedCatalogPrograms,
  type CatalogInstitution,
  searchGlobalCitiesClient,
  searchGlobalInstitutionsClient,
} from "@/lib/global-catalog-browser";
import { requestInstitutionProgramCatalog } from "@/lib/portal.functions";
import { requestInstitutionProgramCatalogClient } from "@/lib/portal-browser";

export type PortalCatalogValue = {
  countryCode: string;
  city: string;
  institution: string;
  institutionId: string;
  program: string;
};

type InstitutionProgram = {
  id: string;
  program_name: string;
  degree_level: string | null;
  language: string | null;
  official_url: string | null;
};

type Props = {
  value: PortalCatalogValue;
  onChange: (value: PortalCatalogValue) => void;
  locale?: string;
  compact?: boolean;
  allowCatalogRequest?: boolean;
};

function sameText(left: string, right: string) {
  return left.localeCompare(right, undefined, { sensitivity: "base" }) === 0;
}

const isStaticHost = import.meta.env.VITE_STATIC_HOST === "true";

export function PortalCatalogFields({
  value,
  onChange,
  locale,
  compact = false,
  allowCatalogRequest = false,
}: Props) {
  const { i18n } = useTranslation();
  const copy = usePortalCatalogCopy();
  const activeLocale = locale || i18n.resolvedLanguage || i18n.language || "tr";
  const discoveryCopy = getPortalDiscoveryCopy(activeLocale);
  const countries = useMemo(() => getCountries(activeLocale), [activeLocale]);
  const getCities = useServerFn(searchGlobalCities);
  const getInstitutions = useServerFn(searchGlobalInstitutions);
  const requestCatalog = useServerFn(requestInstitutionProgramCatalog);
  const cityListId = useId();
  const institutionListId = useId();
  const [citySearch, setCitySearch] = useState(value.city);
  const [institutionSearch, setInstitutionSearch] = useState(value.institution);
  const [institutionHomepage, setInstitutionHomepage] = useState<string | null>(null);
  const deferredCitySearch = useDeferredValue(citySearch.trim());
  const deferredInstitutionSearch = useDeferredValue(institutionSearch.trim());
  const starterCities = useMemo(
    () => getStarterCatalogCities(value.countryCode),
    [value.countryCode],
  );
  const starterInstitutions = useMemo(
    () => getStarterCatalogInstitutions(value.countryCode, value.city, deferredInstitutionSearch),
    [value.countryCode, value.city, deferredInstitutionSearch],
  );
  const starterPrograms = useMemo(
    () =>
      getVerifiedPrograms({
        id: value.institutionId,
        name: value.institution,
        homepageUrl: institutionHomepage,
        countryCode: value.countryCode,
        city: value.city,
      }),
    [value.institutionId, value.institution, institutionHomepage, value.countryCode, value.city],
  );
  useEffect(() => setCitySearch(value.city), [value.city]);
  useEffect(() => setInstitutionSearch(value.institution), [value.institution]);

  const citiesQuery = useQuery({
    queryKey: ["catalog-field-cities", value.countryCode, deferredCitySearch],
    queryFn: async (): Promise<GlobalCitySearchResult> => {
      const data = { countryCode: value.countryCode, query: deferredCitySearch };
      return isStaticHost ? searchGlobalCitiesClient(data) : await getCities({ data });
    },
    enabled: Boolean(value.countryCode) && deferredCitySearch.length >= 2,
    staleTime: 10 * 60_000,
  });
  const cityOptions = useMemo(
    () => mergeCatalogCities(citiesQuery.data, starterCities).cities,
    [citiesQuery.data, starterCities],
  );

  const institutionsQuery = useQuery({
    queryKey: [
      "catalog-field-institutions",
      value.countryCode,
      value.city,
      deferredInstitutionSearch,
    ],
    queryFn: () => {
      const data = {
        countryCode: value.countryCode,
        city: value.city,
        query: deferredInstitutionSearch,
        page: 1,
      };
      return isStaticHost ? searchGlobalInstitutionsClient(data) : getInstitutions({ data });
    },
    enabled: Boolean(value.countryCode) && value.city.trim().length >= 2,
    staleTime: 10 * 60_000,
  });
  const institutionOptions = useMemo(
    () =>
      mergeCatalogInstitutions(
        (institutionsQuery.data?.institutions || []) as CatalogInstitution[],
        starterInstitutions,
      ),
    [institutionsQuery.data?.institutions, starterInstitutions],
  );

  useEffect(() => {
    const match = institutionOptions.find((institution) => institution.id === value.institutionId);
    setInstitutionHomepage(match?.homepageUrl || null);
  }, [value.institutionId, institutionOptions]);

  const programsQuery = useQuery({
    queryKey: ["catalog-field-programs", value.institutionId, value.countryCode],
    queryFn: async (): Promise<InstitutionProgram[]> => {
      if (value.institutionId.startsWith("official:")) return starterPrograms;
      const db = supabase as any;
      const { data, error } = await db
        .from("institution_programs")
        .select("id, program_name, degree_level, language, official_url")
        .in("institution_external_id", [
          value.institutionId,
          value.institutionId.split("/").pop() || value.institutionId,
        ])
        .eq("verified", true)
        .eq("country_code", value.countryCode)
        .order("program_name", { ascending: true })
        .limit(1000);
      if (error && !starterPrograms.length) throw error;
      return mergeVerifiedCatalogPrograms(starterPrograms, data || []);
    },
    enabled: Boolean(value.institutionId),
    retry: false,
    staleTime: 10 * 60_000,
  });
  const programs = useMemo(
    () => mergeVerifiedCatalogPrograms(starterPrograms, programsQuery.data || []),
    [starterPrograms, programsQuery.data],
  );

  const catalogRequest = useMutation({
    mutationFn: () => {
      const data = {
        institutionExternalId: value.institutionId,
        institutionName: value.institution,
        countryCode: value.countryCode,
        city: value.city || null,
        officialUrl: institutionHomepage,
      };
      return isStaticHost ? requestInstitutionProgramCatalogClient(data) : requestCatalog({ data });
    },
    onSuccess: () => toast.success(copy.requestSuccess),
    onError: () => toast.error(copy.requestError),
  });

  const selectCity = (input: string) => {
    setCitySearch(input);
    const match = cityOptions.find((city) => matchesCatalogCity(city, input));
    onChange({
      ...value,
      city: match?.name || input,
      institution: "",
      institutionId: "",
      program: "",
    });
    setInstitutionSearch("");
    setInstitutionHomepage(null);
  };

  const selectInstitution = (input: string) => {
    setInstitutionSearch(input);
    const match = institutionOptions.find((institution) => sameText(institution.name, input));
    setInstitutionHomepage(match?.homepageUrl || null);
    onChange({
      ...value,
      institution: match?.name || input,
      institutionId: match?.id || "",
      program: "",
    });
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-navy outline-none ring-gold/50 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100";

  return (
    <div className={"grid gap-4 " + (compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4")}>
      <label className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-navy">
        {discoveryCopy.country}
        <select
          value={value.countryCode}
          onChange={(event) => {
            setCitySearch("");
            setInstitutionSearch("");
            setInstitutionHomepage(null);
            onChange({
              countryCode: event.target.value,
              city: "",
              institution: "",
              institutionId: "",
              program: "",
            });
          }}
          className={inputClass}
        >
          <option value="">{discoveryCopy.countryPlaceholder}</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      <label className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-sm font-semibold text-navy">
        {discoveryCopy.city}
        <span className="relative block">
          <input
            list={cityListId}
            value={citySearch}
            onChange={(event) => selectCity(event.target.value)}
            placeholder={value.countryCode ? copy.searchMin : discoveryCopy.cityBefore}
            disabled={!value.countryCode}
            maxLength={100}
            autoComplete="off"
            className={inputClass}
          />
          {citiesQuery.isFetching && (
            <Loader2 className="absolute end-3 top-5 h-5 w-5 animate-spin text-teal" />
          )}
        </span>
        <datalist id={cityListId}>
          {cityOptions.map((city) => (
            <option key={city.geonameId || city.name} value={city.name} />
          ))}
        </datalist>
      </label>

      <label className="rounded-2xl border border-violet-200 bg-violet-50 p-3 text-sm font-semibold text-navy">
        {discoveryCopy.institution}
        <span className="relative block">
          <input
            list={institutionListId}
            value={institutionSearch}
            onChange={(event) => selectInstitution(event.target.value)}
            placeholder={
              value.city ? discoveryCopy.institutionPlaceholder : discoveryCopy.institutionBefore
            }
            disabled={!value.city}
            maxLength={200}
            autoComplete="off"
            className={inputClass}
          />
          {institutionsQuery.isFetching && (
            <Loader2 className="absolute end-3 top-5 h-5 w-5 animate-spin text-teal" />
          )}
        </span>
        <datalist id={institutionListId}>
          {institutionOptions.map((institution) => (
            <option key={institution.id} value={institution.name}>
              {[institution.city, institution.region].filter(Boolean).join(" · ")}
            </option>
          ))}
        </datalist>
      </label>

      <label className="rounded-2xl border border-pink-200 bg-pink-50 p-3 text-sm font-semibold text-navy">
        {discoveryCopy.program}
        <select
          value={value.program}
          onChange={(event) => onChange({ ...value, program: event.target.value })}
          disabled={
            !value.institutionId ||
            (programsQuery.isFetching && !programs.length) ||
            programs.length === 0
          }
          className={inputClass}
        >
          <option value="">
            {!value.institutionId
              ? discoveryCopy.programBefore
              : programsQuery.isFetching && !programs.length
                ? discoveryCopy.programLoading
                : programs.length
                  ? discoveryCopy.programPlaceholder
                  : discoveryCopy.programPending}
          </option>
          {programs.map((program) => (
            <option key={program.id} value={program.program_name}>
              {program.program_name}
              {program.degree_level ? " · " + program.degree_level : ""}
              {program.language ? " · " + program.language : ""}
            </option>
          ))}
        </select>
        {value.institutionId && !programsQuery.isFetching && programs.length === 0 && (
          <span className="mt-2 block text-xs font-normal leading-relaxed text-muted-foreground">
            {copy.programsOnly}
            {institutionHomepage && (
              <a
                href={institutionHomepage}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="ms-1 inline-flex min-h-10 items-center font-semibold text-teal hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                {copy.officialCatalog} <ExternalLink className="ms-1 h-3 w-3" />
              </a>
            )}
            {allowCatalogRequest && /^I\d+$/.test(value.institutionId.split("/").pop() || "") && (
              <button
                type="button"
                onClick={() => catalogRequest.mutate()}
                disabled={catalogRequest.isPending}
                className="mt-2 block min-h-10 rounded-lg border border-teal/25 bg-teal/5 px-3 py-2 font-semibold text-teal hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-60"
              >
                {catalogRequest.isPending ? copy.requesting : copy.requestCatalog}
              </button>
            )}
          </span>
        )}
      </label>
    </div>
  );
}
