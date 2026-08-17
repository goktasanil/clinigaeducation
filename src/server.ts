import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { buildBlogCsp, isBlogPath } from "./lib/csp";
import { AUDIT_ID_HEADER, auditIdForPath } from "./lib/audit-id";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return errorPageResponse(request, 500);
}

/** Audit id for a request, reusing a well-formed incoming one. */
function requestAuditId(request: Request | string): string {
  if (typeof request === "string") {
    const pathname = request ? new URL(request, "http://localhost").pathname : "/";
    return auditIdForPath(pathname);
  }
  const { pathname } = new URL(request.url);
  return auditIdForPath(pathname, request.headers.get(AUDIT_ID_HEADER));
}

function errorPageResponse(urlOrRequest: Request | string, status: number): Response {
  const auditId = requestAuditId(urlOrRequest);
  return new Response(renderErrorPage(auditId), {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      [AUDIT_ID_HEADER]: auditId,
    },
  });
}

// Error responses (404/500) always carry the correlation id so the value shown
// on screen and in <meta name="x-audit-id"> matches the header.
function withErrorAuditHeader(request: Request, response: Response): Response {
  if (response.status < 400) return response;
  if (response.headers.has(AUDIT_ID_HEADER)) return response;
  const headers = new Headers(response.headers);
  headers.set(AUDIT_ID_HEADER, requestAuditId(request));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withBaselineSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Blog pages render third-party (Wix + machine-translated) HTML, so they get a
// hardened CSP on top of server-side sanitization.
function withBlogSecurityHeaders(request: Request, response: Response): Response {
  const { pathname } = new URL(request.url);
  if (!isBlogPath(pathname)) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", buildBlogCsp());
  // Correlation id so a page view can be matched with its [sanitize-audit] logs.
  headers.set(AUDIT_ID_HEADER, requestAuditId(request));
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(request, response);
      return withBaselineSecurityHeaders(
        withErrorAuditHeader(request, withBlogSecurityHeaders(request, normalized)),
      );
    } catch (error) {
      console.error(error);
      return withBaselineSecurityHeaders(errorPageResponse(request, 500));
    }
  },
};

