import {
  GraduationCap,
  Plane,
  BookOpenCheck,
  BarChart3,
  FileSearch,
  ScrollText,
} from "lucide-react";

export const SERVICES = [
  { key: "education", icon: GraduationCap },
  { key: "visa", icon: Plane },
  { key: "thesis", icon: BookOpenCheck },
  { key: "statistics", icon: BarChart3 },
  { key: "documents", icon: FileSearch },
  { key: "publication", icon: ScrollText },
] as const;

export const PACKAGE_KEYS = [
  { key: "hourly", recommended: false },
  { key: "bachelor", recommended: false },
  { key: "master", recommended: true },
  { key: "phd", recommended: false },
  { key: "thesis", recommended: true },
  { key: "stats", recommended: false },
] as const;
