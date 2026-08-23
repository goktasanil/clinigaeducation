export type EuropeanCityGuide = {
  city: string;
  country: string;
  countryCode: string;
  slug: string;
  featured?: boolean;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const cityRows: Array<[string, string, string, boolean?]> = [
  ["Tiran", "Arnavutluk", "AL"],
  ["Andorra la Vella", "Andorra", "AD"],
  ["Viyana", "Avusturya", "AT", true],
  ["Graz", "Avusturya", "AT"],
  ["Innsbruck", "Avusturya", "AT"],
  ["Brüksel", "Belçika", "BE", true],
  ["Anvers", "Belçika", "BE"],
  ["Leuven", "Belçika", "BE"],
  ["Gent", "Belçika", "BE"],
  ["Saraybosna", "Bosna-Hersek", "BA"],
  ["Sofya", "Bulgaristan", "BG", true],
  ["Filibe", "Bulgaristan", "BG"],
  ["Zagreb", "Hırvatistan", "HR"],
  ["Split", "Hırvatistan", "HR"],
  ["Lefkoşa", "Kıbrıs", "CY"],
  ["Prag", "Çekya", "CZ", true],
  ["Brno", "Çekya", "CZ"],
  ["Kopenhag", "Danimarka", "DK", true],
  ["Aarhus", "Danimarka", "DK"],
  ["Tallinn", "Estonya", "EE"],
  ["Tartu", "Estonya", "EE"],
  ["Helsinki", "Finlandiya", "FI"],
  ["Turku", "Finlandiya", "FI"],
  ["Paris", "Fransa", "FR", true],
  ["Lyon", "Fransa", "FR"],
  ["Toulouse", "Fransa", "FR"],
  ["Strasbourg", "Fransa", "FR"],
  ["Berlin", "Almanya", "DE", true],
  ["Münih", "Almanya", "DE", true],
  ["Hamburg", "Almanya", "DE"],
  ["Köln", "Almanya", "DE"],
  ["Frankfurt", "Almanya", "DE"],
  ["Heidelberg", "Almanya", "DE"],
  ["Atina", "Yunanistan", "GR", true],
  ["Selanik", "Yunanistan", "GR"],
  ["Budapeşte", "Macaristan", "HU", true],
  ["Szeged", "Macaristan", "HU"],
  ["Reykjavik", "İzlanda", "IS"],
  ["Dublin", "İrlanda", "IE", true],
  ["Galway", "İrlanda", "IE"],
  ["Roma", "İtalya", "IT", true],
  ["Milano", "İtalya", "IT", true],
  ["Bologna", "İtalya", "IT"],
  ["Floransa", "İtalya", "IT"],
  ["Padova", "İtalya", "IT", true],
  ["Torino", "İtalya", "IT"],
  ["Napoli", "İtalya", "IT"],
  ["Priştine", "Kosova", "XK"],
  ["Riga", "Letonya", "LV", true],
  ["Vaduz", "Lihtenştayn", "LI"],
  ["Vilnius", "Litvanya", "LT", true],
  ["Kaunas", "Litvanya", "LT"],
  ["Lüksemburg", "Lüksemburg", "LU"],
  ["Valletta", "Malta", "MT"],
  ["Kişinev", "Moldova", "MD"],
  ["Monako", "Monako", "MC"],
  ["Podgoritsa", "Karadağ", "ME"],
  ["Amsterdam", "Hollanda", "NL", true],
  ["Rotterdam", "Hollanda", "NL"],
  ["Utrecht", "Hollanda", "NL"],
  ["Groningen", "Hollanda", "NL"],
  ["Üsküp", "Kuzey Makedonya", "MK"],
  ["Oslo", "Norveç", "NO", true],
  ["Bergen", "Norveç", "NO"],
  ["Varşova", "Polonya", "PL", true],
  ["Krakow", "Polonya", "PL"],
  ["Wroclaw", "Polonya", "PL"],
  ["Poznan", "Polonya", "PL"],
  ["Lizbon", "Portekiz", "PT", true],
  ["Porto", "Portekiz", "PT", true],
  ["Coimbra", "Portekiz", "PT"],
  ["Bükreş", "Romanya", "RO", true],
  ["Cluj-Napoca", "Romanya", "RO"],
  ["San Marino", "San Marino", "SM"],
  ["Belgrad", "Sırbistan", "RS"],
  ["Novi Sad", "Sırbistan", "RS"],
  ["Bratislava", "Slovakya", "SK", true],
  ["Košice", "Slovakya", "SK"],
  ["Ljubljana", "Slovenya", "SI"],
  ["Madrid", "İspanya", "ES", true],
  ["Barcelona", "İspanya", "ES", true],
  ["Valencia", "İspanya", "ES", true],
  ["Sevilla", "İspanya", "ES"],
  ["Granada", "İspanya", "ES"],
  ["Stockholm", "İsveç", "SE", true],
  ["Göteborg", "İsveç", "SE"],
  ["Lund", "İsveç", "SE"],
  ["Uppsala", "İsveç", "SE"],
  ["Zürih", "İsviçre", "CH", true],
  ["Cenevre", "İsviçre", "CH"],
  ["Lozan", "İsviçre", "CH"],
  ["Londra", "Birleşik Krallık", "GB", true],
  ["Manchester", "Birleşik Krallık", "GB"],
  ["Edinburgh", "Birleşik Krallık", "GB"],
  ["Glasgow", "Birleşik Krallık", "GB"],
  ["Birmingham", "Birleşik Krallık", "GB"],
];

export const EUROPEAN_CITY_GUIDES: EuropeanCityGuide[] = cityRows.map(
  ([city, country, countryCode, featured]) => ({
    city,
    country,
    countryCode,
    slug: slugify(city),
    featured,
  }),
);

export function cityGuideSlug(value: string) {
  return slugify(value);
}

export function getEuropeanCityGuide(slug: string) {
  return EUROPEAN_CITY_GUIDES.find((city) => city.slug === slug);
}
