import type { JournalPhoto } from "@/data/journal/types";

export function JournalPhotoCredit({ photo }: { photo?: JournalPhoto }) {
  if (!photo) return null;
  return (
    <figcaption className="mt-3 text-xs leading-6 text-muted-foreground">
      © {photo.author || "Wikimedia Commons"} ·{" "}
      <a
        href={photo.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        Wikimedia Commons
      </a>{" "}
      ·{" "}
      <a
        href={photo.licenseUrl || photo.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {photo.license}
      </a>
    </figcaption>
  );
}
