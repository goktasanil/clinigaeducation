/**
 * Country-level overview coordinates, not university or campus locations.
 * Derived from mledoze/countries (cca2, latlng, area), retrieved 2026-10-27.
 * Source: https://github.com/mledoze/countries/blob/master/countries.json
 * Database license: Open Data Commons Open Database License (ODbL) 1.0.
 * https://opendatacommons.org/licenses/odbl/1-0/
 * This compact derived coordinate database remains available under ODbL 1.0.
 * Coordinates use [latitude, longitude, land area in square kilometres].
 * The source uses -1 for an unknown area; preserve it instead of inventing one.
 */
export const PORTAL_COUNTRY_LOCATIONS: Readonly<Record<string, readonly [number, number, number]>> =
  {
    AD: [42.5, 1.5, 468],
    AE: [24, 54, 83600],
    AF: [33, 65, 652230],
    AG: [17.05, -61.8, 442],
    AI: [18.25, -63.1667, 91],
    AL: [41, 20, 28748],
    AM: [40, 45, 29743],
    AO: [-12.5, 18.5, 1.2467e6],
    AQ: [-90, 0, 1.4e7],
    AR: [-34, -64, 2.7804e6],
    AS: [-14.3333, -170, 199],
    AT: [47.3333, 13.3333, 83871],
    AU: [-27, 133, 7.69202e6],
    AW: [12.5, -69.9667, 180],
    AX: [60.1167, 19.9, 1580],
    AZ: [40.5, 47.5, 86600],
    BA: [44, 18, 51209],
    BB: [13.1667, -59.5333, 430],
    BD: [24, 90, 147570],
    BE: [50.8333, 4, 30528],
    BF: [13, -2, 272967],
    BG: [43, 25, 110879],
    BH: [26, 50.55, 765],
    BI: [-3.5, 30, 27834],
    BJ: [9.5, 2.25, 112622],
    BL: [18.5, -63.4167, 21],
    BM: [32.3333, -64.75, 54],
    BN: [4.5, 114.667, 5765],
    BO: [-17, -65, 1.09858e6],
    BQ: [12.18, -68.25, 328],
    BR: [-10, -55, 8.51577e6],
    BS: [24.25, -76, 13943],
    BT: [27.5, 90.5, 38394],
    BV: [-54.4333, 3.4, 49],
    BW: [-22, 24, 582000],
    BY: [53, 28, 207600],
    BZ: [17.25, -88.75, 22966],
    CA: [60, -95, 9.98467e6],
    CC: [-12.5, 96.8333, 14],
    CD: [0, 25, 2.34486e6],
    CF: [7, 21, 622984],
    CG: [-1, 15, 342000],
    CH: [47, 8, 41284],
    CI: [8, -5, 322463],
    CK: [-21.2333, -159.767, 236],
    CL: [-30, -71, 756102],
    CM: [6, 12, 475442],
    CN: [35, 105, 9.70696e6],
    CO: [4, -72, 1.14175e6],
    CR: [10, -84, 51100],
    CU: [21.5, -80, 109884],
    CV: [16, -24, 4033],
    CW: [12.1167, -68.9333, 444],
    CX: [-10.5, 105.667, 135],
    CY: [35, 33, 9251],
    CZ: [49.75, 15.5, 78865],
    DE: [51, 9, 357114],
    DJ: [11.5, 43, 23200],
    DK: [56, 10, 43094],
    DM: [15.4167, -61.3333, 751],
    DO: [19, -70.6667, 48671],
    DZ: [28, 3, 2.38174e6],
    EC: [-2, -77.5, 276841],
    EE: [59, 26, 45227],
    EG: [27, 30, 1.00245e6],
    EH: [24.5, -13, 266000],
    ER: [15, 39, 117600],
    ES: [40, -4, 505992],
    ET: [8, 38, 1.1043e6],
    FI: [64, 26, 338424],
    FJ: [-18, 175, 18272],
    FK: [-51.75, -59, 12173],
    FM: [6.91667, 158.25, 702],
    FO: [62, -7, 1393],
    FR: [46, 2, 551695],
    GA: [-1, 11.75, 267668],
    GB: [54, -2, 242900],
    GD: [12.1167, -61.6667, 344],
    GE: [42, 43.5, 69700],
    GF: [4, -53, 83534],
    GG: [49.4667, -2.58333, 78],
    GH: [8, -2, 238533],
    GI: [36.1333, -5.35, 6],
    GL: [72, -40, 2.16609e6],
    GM: [13.4667, -16.5667, 10689],
    GN: [11, -10, 245857],
    GP: [16.25, -61.5833, 1628],
    GQ: [2, 10, 28051],
    GR: [39, 22, 131990],
    GS: [-54.5, -37, 3903],
    GT: [15.5, -90.25, 108889],
    GU: [13.4667, 144.783, 549],
    GW: [12, -15, 36125],
    GY: [5, -59, 214969],
    HK: [22.267, 114.188, 1104],
    HM: [-53.1, 72.5167, 412],
    HN: [15, -86.5, 112492],
    HR: [45.1667, 15.5, 56594],
    HT: [19, -72.4167, 27750],
    HU: [47, 20, 93028],
    ID: [-5, 120, 1.90457e6],
    IE: [53, -8, 70273],
    IL: [31.47, 35.13, 20770],
    IM: [54.25, -4.5, 572],
    IN: [20, 77, 3.28759e6],
    IO: [-6, 71.5, 60],
    IQ: [33, 44, 438317],
    IR: [32, 53, 1.6482e6],
    IS: [65, -18, 103000],
    IT: [42.8333, 12.8333, 301336],
    JE: [49.25, -2.16667, 116],
    JM: [18.25, -77.5, 10991],
    JO: [31, 36, 89342],
    JP: [36, 138, 377930],
    KE: [1, 38, 580367],
    KG: [41, 75, 199951],
    KH: [13, 105, 181035],
    KI: [1.41667, 173, 811],
    KM: [-12.1667, 44.25, 1862],
    KN: [17.3333, -62.75, 261],
    KP: [40, 127, 120538],
    KR: [37, 127.5, 100210],
    KW: [29.5, 45.75, 17818],
    KY: [19.5, -80.5, 264],
    KZ: [48, 68, 2.7249e6],
    LA: [18, 105, 236800],
    LB: [33.8333, 35.8333, 10452],
    LC: [13.8833, -60.9667, 616],
    LI: [47.2667, 9.53333, 160],
    LK: [7, 81, 65610],
    LR: [6.5, -9.5, 111369],
    LS: [-29.5, 28.5, 30355],
    LT: [56, 24, 65300],
    LU: [49.75, 6.16667, 2586],
    LV: [57, 25, 64559],
    LY: [25, 17, 1.75954e6],
    MA: [32, -5, 446550],
    MC: [43.7333, 7.4, 2.02],
    MD: [47, 29, 33846],
    ME: [42.5, 19.3, 13812],
    MF: [18.0833, -63.95, 53],
    MG: [-20, 47, 587041],
    MH: [9, 168, 181],
    MK: [41.8333, 22, 25713],
    ML: [17, -4, 1.24019e6],
    MM: [22, 98, 676578],
    MN: [46, 105, 1.56411e6],
    MO: [22.1667, 113.55, 30],
    MP: [15.2, 145.75, 464],
    MQ: [14.6667, -61, 1128],
    MR: [20, -12, 1.0307e6],
    MS: [16.75, -62.2, 102],
    MT: [35.8333, 14.5833, 316],
    MU: [-20.2833, 57.55, 2040],
    MV: [3.25, 73, 300],
    MW: [-13.5, 34, 118484],
    MX: [23, -102, 1.96438e6],
    MY: [2.5, 112.5, 330803],
    MZ: [-18.25, 35, 801590],
    NA: [-22, 17, 825615],
    NC: [-21.5, 165.5, 18575],
    NE: [16, 8, 1.267e6],
    NF: [-29.0333, 167.95, 36],
    NG: [10, 8, 923768],
    NI: [13, -85, 130373],
    NL: [52.5, 5.75, 41850],
    NO: [62, 10, 323802],
    NP: [28, 84, 147181],
    NR: [-0.533333, 166.917, 21],
    NU: [-19.0333, -169.867, 260],
    NZ: [-41, 174, 270467],
    OM: [21, 57, 309500],
    PA: [9, -80, 75417],
    PE: [-10, -76, 1.28522e6],
    PF: [-15, -140, 4167],
    PG: [-6, 147, 462840],
    PH: [13, 122, 342353],
    PK: [30, 70, 881912],
    PL: [52, 20, 312679],
    PM: [46.8333, -56.3333, 242],
    PN: [-25.0667, -130.1, 47],
    PR: [18.25, -66.5, 8870],
    PS: [31.9, 35.2, 6220],
    PT: [39.5, -8, 92090],
    PW: [7.5, 134.5, 459],
    PY: [-23, -58, 406752],
    QA: [25.5, 51.25, 11586],
    RE: [-21.15, 55.5, 2511],
    RO: [46, 25, 238391],
    RS: [44, 21, 88361],
    RU: [60, 100, 1.70982e7],
    RW: [-2, 30, 26338],
    SA: [25, 45, 2.14969e6],
    SB: [-8, 159, 28896],
    SC: [-4.58333, 55.6667, 452],
    SD: [15, 30, 1.88607e6],
    SE: [62, 15, 450295],
    SG: [1.36667, 103.8, 710],
    SH: [-15.95, -5.72, 394],
    SI: [46.1167, 14.8167, 20273],
    SJ: [78, 20, -1],
    SK: [48.6667, 19.5, 49037],
    SL: [8.5, -11.5, 71740],
    SM: [43.7667, 12.4167, 61],
    SN: [14, -14, 196722],
    SO: [10, 49, 637657],
    SR: [4, -56, 163820],
    SS: [7, 30, 619745],
    ST: [1, 7, 964],
    SV: [13.8333, -88.9167, 21041],
    SX: [18.0333, -63.05, 34],
    SY: [35, 38, 185180],
    SZ: [-26.5, 31.5, 17364],
    TC: [21.75, -71.5833, 948],
    TD: [15, 19, 1.284e6],
    TF: [-49.25, 69.167, 7747],
    TG: [8, 1.16667, 56785],
    TH: [15, 100, 513120],
    TJ: [39, 71, 143100],
    TK: [-9, -172, 12],
    TL: [-8.83333, 125.917, 14874],
    TM: [40, 60, 488100],
    TN: [34, 9, 163610],
    TO: [-20, -175, 747],
    TR: [39, 35, 783562],
    TT: [11, -61, 5130],
    TV: [-8, 178, 26],
    TW: [23.5, 121, 36193],
    TZ: [-6, 35, 945087],
    UA: [49, 32, 603500],
    UG: [1, 32, 241550],
    UM: [19.3, 166.633, 34.2],
    US: [38, -97, 9.37261e6],
    UY: [-33, -56, 181034],
    UZ: [41, 64, 447400],
    VA: [41.9, 12.45, 0.44],
    VC: [13.25, -61.2, 389],
    VE: [8, -66, 916445],
    VG: [18.4314, -64.6231, 151],
    VI: [18.35, -64.9333, 347],
    VN: [16.1667, 107.833, 331212],
    VU: [-16, 167, 12189],
    WF: [-13.3, -176.2, 142],
    WS: [-13.5833, -172.333, 2842],
    YE: [15, 48, 527968],
    YT: [-12.8333, 45.1667, 374],
    ZA: [-29, 24, 1.22104e6],
    ZM: [-15, 30, 752612],
    ZW: [-20, 30, 390757],
  };

export type PortalMapFocus = {
  countryCode?: string;
  city?: string;
  institutionName?: string;
  latitude?: number | null;
  longitude?: number | null;
  coordinatePrecision?: "city" | "institution";
  level: "world" | "country" | "city" | "institution";
};

export type PortalMapTarget = {
  center: [number, number];
  zoom: number;
  precision: PortalMapFocus["level"];
};

export function validPortalCoordinates(latitude: unknown, longitude: unknown): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function countryZoom(area: number): number {
  if (area <= 0) return 2.7;
  if (area >= 8_000_000) return 2;
  if (area >= 2_000_000) return 2.7;
  if (area >= 600_000) return 3.5;
  if (area >= 150_000) return 4.3;
  if (area >= 35_000) return 5;
  if (area >= 5_000) return 5.8;
  if (area >= 700) return 6.4;
  return 7;
}

export function resolvePortalMapFocus(focus: PortalMapFocus): PortalMapTarget {
  const world: PortalMapTarget = { center: [15, 18], zoom: 1.3, precision: "world" };
  if (focus.level === "world") return world;

  // An institution must never be positioned at a guessed city/country centre.
  // Fall back to a visibly labelled country overview if its actual point is absent.
  if (
    (focus.level === "city" || focus.level === "institution") &&
    validPortalCoordinates(focus.latitude, focus.longitude)
  ) {
    const precision = focus.coordinatePrecision === "city" ? "city" : focus.level;
    return {
      center: [focus.longitude as number, Math.max(-85, Math.min(85, focus.latitude))],
      zoom: precision === "institution" ? 15.3 : 10,
      precision,
    };
  }

  const code = focus.countryCode?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{2}$/.test(code)) return world;
  const location = PORTAL_COUNTRY_LOCATIONS[code];
  if (!location) return world;
  return {
    center: [location[1], Math.max(-85, Math.min(85, location[0]))],
    zoom: countryZoom(location[2]),
    precision: "country",
  };
}
