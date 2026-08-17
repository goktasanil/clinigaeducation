import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { AUDIT_ID_HEADER, auditIdForPath } from "@/lib/audit-id";

/**
 * Shows (and injects into <head>) the same correlation id that the server sends
 * on the X-Audit-Id response header, so a user can quote it in a support
 * request and we can match it to server-side logs.
 */
export function AuditIdNotice({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [auditId, setAuditId] = useState(() => auditIdForPath(pathname));

  useEffect(() => {
    const id = auditIdForPath(pathname);
    setAuditId(id);

    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="x-audit-id"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "x-audit-id");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", id);
  }, [pathname]);

  return (
    <p
      className={
        className ??
        "mt-6 select-all font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
      }
      data-audit-id={auditId}
      title={`${AUDIT_ID_HEADER}: ${auditId}`}
    >
      {AUDIT_ID_HEADER}: {auditId}
    </p>
  );
}
