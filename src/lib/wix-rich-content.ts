// Minimal Wix Ricos (rich content) -> sanitized HTML converter.
// Handles the node types Wix Blog typically emits: PARAGRAPH, HEADING,
// IMAGE, BULLETED_LIST / ORDERED_LIST + LIST_ITEM, BLOCKQUOTE, DIVIDER,
// CODE_BLOCK, VIDEO, EMBED. Unknown nodes are skipped silently.

type RicosNode = {
  type: string;
  id?: string;
  nodes?: RicosNode[];
  textData?: {
    text: string;
    decorations?: Array<{
      type: string;
      linkData?: { link?: { url?: string; target?: string } };
    }>;
  };
  headingData?: { level?: number };
  imageData?: {
    image?: {
      src?: { url?: string; id?: string };
      width?: number;
      height?: number;
    };
    altText?: string;
    caption?: string;
  };
  videoData?: { video?: { src?: { url?: string; id?: string } } };
  codeBlockData?: unknown;
  dividerData?: unknown;
};

export type RicosContent = { nodes?: RicosNode[] } | null | undefined;

const escapeHtml = (raw: string): string =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttr = (raw: string): string => escapeHtml(raw);

const isSafeUrl = (url: string): boolean => {
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("#")
  );
};

const buildImageUrl = (src?: { url?: string; id?: string }): string | null => {
  if (!src) return null;
  if (src.url && isSafeUrl(src.url)) return src.url;
  if (src.id) return `https://static.wixstatic.com/media/${src.id}`;
  return null;
};

const renderTextNode = (node: RicosNode): string => {
  const text = node.textData?.text ?? "";
  let html = escapeHtml(text);
  const decorations = node.textData?.decorations ?? [];

  let linkOpen = "";
  let linkClose = "";
  for (const d of decorations) {
    if (d.type === "LINK" && d.linkData?.link?.url) {
      const url = d.linkData.link.url;
      if (isSafeUrl(url)) {
        linkOpen = `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">`;
        linkClose = "</a>";
      }
    }
  }

  for (const d of decorations) {
    if (d.type === "BOLD") html = `<strong>${html}</strong>`;
    else if (d.type === "ITALIC") html = `<em>${html}</em>`;
    else if (d.type === "UNDERLINE") html = `<u>${html}</u>`;
  }

  return `${linkOpen}${html}${linkClose}`;
};

const renderInline = (nodes?: RicosNode[]): string => {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "TEXT") return renderTextNode(n);
      // Allow nested inline structures defensively
      return renderInline(n.nodes);
    })
    .join("");
};

const renderImage = (node: RicosNode): string => {
  const src = buildImageUrl(node.imageData?.image?.src);
  if (!src) return "";
  const alt = escapeAttr(node.imageData?.altText ?? "");
  const w = node.imageData?.image?.width;
  const h = node.imageData?.image?.height;
  const dims = w && h ? ` width="${w}" height="${h}"` : "";
  const caption = node.imageData?.caption
    ? `<figcaption>${escapeHtml(node.imageData.caption)}</figcaption>`
    : "";
  return `<figure><img src="${escapeAttr(src)}" alt="${alt}"${dims} loading="lazy" />${caption}</figure>`;
};

const renderListItem = (node: RicosNode): string => {
  // LIST_ITEM contains PARAGRAPH children whose inline content we want unwrapped.
  const inner = (node.nodes ?? [])
    .map((child) =>
      child.type === "PARAGRAPH" ? renderInline(child.nodes) : renderNode(child),
    )
    .join("");
  return `<li>${inner}</li>`;
};

const renderNode = (node: RicosNode): string => {
  switch (node.type) {
    case "PARAGRAPH": {
      const inner = renderInline(node.nodes);
      return inner ? `<p>${inner}</p>` : "";
    }
    case "HEADING": {
      const level = Math.min(Math.max(node.headingData?.level ?? 2, 1), 6);
      return `<h${level}>${renderInline(node.nodes)}</h${level}>`;
    }
    case "BULLETED_LIST":
      return `<ul>${(node.nodes ?? []).map(renderListItem).join("")}</ul>`;
    case "ORDERED_LIST":
      return `<ol>${(node.nodes ?? []).map(renderListItem).join("")}</ol>`;
    case "LIST_ITEM":
      return renderListItem(node);
    case "BLOCKQUOTE":
      return `<blockquote>${(node.nodes ?? []).map(renderNode).join("")}</blockquote>`;
    case "CODE_BLOCK":
      return `<pre><code>${renderInline(node.nodes)}</code></pre>`;
    case "DIVIDER":
      return "<hr />";
    case "IMAGE":
      return renderImage(node);
    case "VIDEO": {
      const url = node.videoData?.video?.src?.url;
      return url && isSafeUrl(url)
        ? `<p><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></p>`
        : "";
    }
    default:
      // Unknown container: try to render its children
      if (node.nodes && node.nodes.length) {
        return node.nodes.map(renderNode).join("");
      }
      return "";
  }
};

export const ricosToHtml = (content: RicosContent): string => {
  if (!content?.nodes) return "";
  return content.nodes.map(renderNode).join("\n");
};
