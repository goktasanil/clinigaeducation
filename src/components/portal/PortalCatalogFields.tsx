/* eslint-disable @typescript-eslint/no-explicit-any -- Catalogue tables are newer than generated Supabase types. */
import { useDeferredValue, useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getCountries } from "@/data/portal";
import { supabase } from "@/integrations/supabase/client";
import { searchGlobalCities, searchGlobalInstitutions } from "@/lib/global-catalog.functions";
import {
  type GlobalCitySearchResult,
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

type Institution = {
  id: string;
  name: string;
  city: string;
  type: string;
  homepageUrl: string | null;
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
  locale = "tr",
  compact = false,
  allowCatalogRequest = false,
}: Props) {
  const countries = useMemo(() => getCountries(locale), [locale]);
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

  const citiesQuery = useQuery({
    queryKey: ["catalog-field-cities", value.countryCode, deferredCitySearch],
    queryFn: async (): Promise<GlobalCitySearchResult> => {
      const data = { countryCode: value.countryCode, query: deferredCitySearch };
      return isStaticHost ? searchGlobalCitiesClient(data) : await getCities({ data });
    },
    enabled: deferredCitySearch.length >= 2,
    staleTime: 10 * 60_000,
  });
  const cityOptions = citiesQuery.data?.cities || [];

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
    enabled: value.city.trim().length >= 2,
    staleTime: 10 * 60_000,
  });
  const institutionOptions = (institutionsQuery.data?.institutions || []) as Institution[];

  const programsQuery = useQuery({
    queryKey: ["catalog-field-programs", value.institutionId],
    queryFn: async (): Promise<InstitutionProgram[]> => {
      const db = supabase as any;
      const { data, error } = await db
        .from("institution_programs")
        .select("id, program_name, degree_level, language, official_url")
        .eq("institution_external_id", value.institutionId)
        .eq("verified", true)
        .order("program_name", { ascending: true })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(value.institutionId),
    retry: false,
    staleTime: 10 * 60_000,
  });
  const programs = programsQuery.data || [];
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
    onSuccess: () => toast.success("Resmî bölüm kataloğu inceleme sırasına alındı."),
    onError: () => toast.error("Katalog talebi gönderilemedi. Lütfen tekrar deneyin."),
  });

  const selectCity = (input: string) => {
    setCitySearch(input);
    const match = cityOptions.find((city) => sameText(city.name, input));
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
        Ülke
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
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      <label className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-sm font-semibold text-navy">
        Şehir
        <span className="relative block">
          <input
            list={cityListId}
            value={citySearch}
            onChange={(event) => selectCity(event.target.value)}
            placeholder="En az 2 harf yazarak ara"
            maxLength={100}
            autoComplete="off"
            className={inputClass}
          />
          {citiesQuery.isFetching && (
            <Loader2 className="absolute right-3 top-5 h-5 w-5 animate-spin text-teal" />
          )}
        </span>
        <datalist id={cityListId}>
          {cityOptions.map((city) => (
            <option key={city.geonameId || city.name} value={city.name} />
          ))}
        </datalist>
      </label>

      <label className="rounded-2xl border border-violet-200 bg-violet-50 p-3 text-sm font-semibold text-navy">
        Üniversite / yükseköğretim kurumu
        <span className="relative block">
          <input
            list={institutionListId}
            value={institutionSearch}
            onChange={(event) => selectInstitution(event.target.value)}
            placeholder={value.city ? "Kurum adını ara" : "Önce şehir seçin"}
            disabled={!value.city}
            maxLength={200}
            autoComplete="off"
            className={inputClass}
          />
          {institutionsQuery.isFetching && (
            <Loader2 className="absolute right-3 top-5 h-5 w-5 animate-spin text-teal" />
          )}
        </span>
        <datalist id={institutionListId}>
          {institutionOptions.map((institution) => (
            <option key={institution.id} value={institution.name}>
              {[institution.city, institution.type].filter(Boolean).join(" · ")}
            </option>
          ))}
        </datalist>
      </label>

      <label className="rounded-2xl border border-pink-200 bg-pink-50 p-3 text-sm font-semibold text-navy">
        Gerçek bölüm / program
        <select
          value={value.program}
          onChange={(event) => onChange({ ...value, program: event.target.value })}
          disabled={!value.institutionId || programsQuery.isFetching || programs.length === 0}
          className={inputClass}
        >
          <option value="">
            {!value.institutionId
              ? "Önce listeden üniversite seçin"
              : programsQuery.isFetching
                ? "Resmî programlar yükleniyor"
                : programs.length
                  ? "Bölüm / program seçin"
                  : "Doğrulanmış program kataloğu bekleniyor"}
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
            Genel alan gösterilmez. Yalnızca kuruma ait doğrulanmış programlar yayınlanır.
            {institutionHomepage && (
              <a
                href={institutionHomepage}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="ml-1 inline-flex items-center font-semibold text-teal hover:text-gold"
              >
                Resmî kataloğu aç <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
            {allowCatalogRequest && (
              <button
                type="button"
                onClick={() => catalogRequest.mutate()}
                disabled={catalogRequest.isPending}
                className="mt-2 block min-h-10 rounded-lg border border-teal/25 bg-teal/5 px-3 py-2 font-semibold text-teal hover:border-gold hover:text-gold disabled:opacity-60"
              >
                {catalogRequest.isPending
                  ? "Talep gönderiliyor…"
                  : "Gerçek bölüm listesini ekleme talebi gönder"}
              </button>
            )}
          </span>
        )}
      </label>
    </div>
  );
}
