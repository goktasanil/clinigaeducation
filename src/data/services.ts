import {
  GraduationCap,
  Plane,
  BookOpenCheck,
  BarChart3,
  FileSearch,
  ScrollText,
} from "lucide-react";

export const SERVICES = [
  { key: "education", slug: "yurt-disi-egitim-danismanligi", icon: GraduationCap },
  { key: "visa", slug: "vize-oturum-danismanligi", icon: Plane },
  { key: "thesis", slug: "tez-danismanligi", icon: BookOpenCheck },
  { key: "statistics", slug: "istatistik-analizi", icon: BarChart3 },
  { key: "documents", slug: "belge-inceleme", icon: FileSearch },
  { key: "publication", slug: "akademik-yayin-destegi", icon: ScrollText },
] as const;

export const PACKAGE_KEYS = [
  { key: "hourly", recommended: false },
  { key: "bachelor", recommended: false },
  { key: "master", recommended: true },
  { key: "phd", recommended: false },
  { key: "thesis", recommended: true },
  { key: "stats", recommended: false },
] as const;
