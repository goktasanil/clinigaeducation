function normalizeWixPost(post, audit, publicFiles = {}) {
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const safeUrl = (value) => {
    if (typeof value !== "string" || /[\u0000-\u0020]/.test(value)) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/") && !value.startsWith("//"))
      return "https://www.anilgoktas.org" + value;
    if (value.startsWith("#")) return value;
    return null;
  };
  const mediaUrl = (source) => {
    if (!source) return null;
    return (
      safeUrl(source.url) ||
      (source.id && /^[a-zA-Z0-9_.~-]+$/.test(source.id)
        ? "https://static.wixstatic.com/media/" + source.id
        : null)
    );
  };
  const sourceUrl =
    safeUrl((post.url?.base || "") + (post.url?.path || "")) ||
    "https://www.anilgoktas.org/post/" + encodeURIComponent(post.slug || post.id);
  function render(node) {
    if (!node) return "";
    audit.nodeTypes[node.type] = (audit.nodeTypes[node.type] || 0) + 1;
    const children = () => (node.nodes || []).map(render).join("");
    if (node.type === "TEXT") {
      let html = escape(node.textData?.text || "").replace(/\n/g, "<br />");
      for (const decoration of node.textData?.decorations || []) {
        if (decoration.type === "BOLD") html = "<strong>" + html + "</strong>";
        if (decoration.type === "ITALIC") html = "<em>" + html + "</em>";
        if (decoration.type === "UNDERLINE") html = "<u>" + html + "</u>";
        if (decoration.type === "STRIKETHROUGH") html = "<s>" + html + "</s>";
        if (decoration.type === "CODE") html = "<code>" + html + "</code>";
        if (decoration.type === "LINK") {
          const url = safeUrl(decoration.linkData?.link?.url);
          if (url)
            html =
              '<a href="' +
              escape(url) +
              '" target="_blank" rel="noopener noreferrer">' +
              html +
              "</a>";
          else audit.blockedLinkCount += 1;
        }
      }
      return html;
    }
    if (node.type === "PARAGRAPH") {
      const html = children();
      return html ? "<p>" + html + "</p>" : "";
    }
    if (node.type === "HEADING") {
      const level = Math.min(6, Math.max(2, Number(node.headingData?.level) || 2));
      return "<h" + level + ">" + children() + "</h" + level + ">";
    }
    const wrappers = {
      BULLETED_LIST: "ul",
      ORDERED_LIST: "ol",
      LIST_ITEM: "li",
      BLOCKQUOTE: "blockquote",
      TABLE: "table",
      TABLE_ROW: "tr",
      TABLE_CELL: node.tableCellData?.header ? "th" : "td",
    };
    if (wrappers[node.type]) {
      const tag = wrappers[node.type];
      const content = children();
      return (
        "<" +
        tag +
        ">" +
        (tag === "table" ? "<tbody>" + content + "</tbody>" : content) +
        "</" +
        tag +
        ">"
      );
    }
    if (node.type === "CODE_BLOCK") return "<pre><code>" + children() + "</code></pre>";
    if (node.type === "DIVIDER") return "<hr />";
    if (node.type === "IMAGE") {
      const src = mediaUrl(node.imageData?.image?.src);
      if (!src) return "";
      const dimensions = node.imageData.image;
      const width =
        Number.isFinite(dimensions.width) && dimensions.width > 0
          ? ' width="' + Math.floor(dimensions.width) + '"'
          : "";
      const height =
        Number.isFinite(dimensions.height) && dimensions.height > 0
          ? ' height="' + Math.floor(dimensions.height) + '"'
          : "";
      const caption = node.imageData?.caption
        ? "<figcaption>" + escape(node.imageData.caption) + "</figcaption>"
        : "";
      return (
        '<figure><img src="' +
        escape(src) +
        '" alt="' +
        escape(node.imageData?.altText || "") +
        '"' +
        width +
        height +
        ' loading="lazy" />' +
        caption +
        "</figure>"
      );
    }
    if (node.type === "GIF") {
      const gif = node.gifData;
      const src = safeUrl(gif?.original?.gif) || safeUrl(gif?.downsized?.gif);
      if (!src) return "";
      const width =
        Number.isFinite(gif.width) && gif.width > 0 ? ' width="' + Math.floor(gif.width) + '"' : "";
      const height =
        Number.isFinite(gif.height) && gif.height > 0
          ? ' height="' + Math.floor(gif.height) + '"'
          : "";
      return (
        '<figure><img src="' +
        escape(src) +
        '" alt="' +
        escape(gif.altText || "") +
        '"' +
        width +
        height +
        ' loading="lazy" /></figure>'
      );
    }
    if (node.type === "FILE") {
      const file = node.fileData || {};
      const descriptor = publicFiles[file.src?.id];
      const src =
        file.src?.private !== true && descriptor?.private !== true
          ? safeUrl(descriptor?.url) || safeUrl(file.src?.url)
          : null;
      return (
        '<p><a href="' +
        escape(src || sourceUrl) +
        '" target="_blank" rel="noopener noreferrer">' +
        escape(file.name || post.title) +
        "</a></p>"
      );
    }
    if (node.type === "VIDEO" || node.type === "EMBED" || node.type === "HTML") {
      audit.externalMediaCount += 1;
      const url =
        safeUrl(node.videoData?.video?.src?.url) || safeUrl(node.embedData?.src) || sourceUrl;
      const thumbnail = mediaUrl(node.videoData?.thumbnail?.src);
      const caption = escape(node.videoData?.title || node.embedData?.title || post.title || "");
      return (
        "<figure>" +
        (thumbnail
          ? '<a href="' +
            escape(url) +
            '" target="_blank" rel="noopener noreferrer"><img src="' +
            escape(thumbnail) +
            '" alt="' +
            caption +
            '" loading="lazy" /></a>'
          : "") +
        '<figcaption><a href="' +
        escape(url) +
        '" target="_blank" rel="noopener noreferrer">' +
        caption +
        "</a></figcaption></figure>"
      );
    }
    audit.unknownNodeTypes[node.type] = (audit.unknownNodeTypes[node.type] || 0) + 1;
    return children();
  }
  let html = (post.richContent?.nodes || []).map(render).join("\n");
  if (!html && post.contentText) {
    html =
      "<p>" +
      escape(post.contentText)
        .replace(/\n\s*\n/g, "</p><p>")
        .replace(/\n/g, "<br />") +
      "</p>";
    audit.textFallbackCount += 1;
  }
  const cover = post.media?.wixMedia?.image;
  const firstImage = (post.richContent?.nodes || []).find(
    (node) => node.type === "IMAGE",
  )?.imageData;
  const coverImage = cover ? mediaUrl(cover) : mediaUrl(firstImage?.image?.src);
  const coverDimensions = cover || firstImage?.image;
  const seoTags = post.seoData?.tags || [];
  const titleTag = seoTags.find((tag) => tag.type === "title");
  const descriptionTag = seoTags.find((tag) => tag.props?.name === "description");
  return {
    id: post.id,
    slug: post.slug,
    title: post.title || "",
    excerpt: post.excerpt || "",
    language: post.language || "tr",
    translationId: post.translationId || null,
    translations: (post.translations || [])
      .map((translation) => ({
        postId: translation.postId || translation.id || null,
        language: translation.language || null,
      }))
      .filter((translation) => translation.postId && translation.language),
    html,
    publishedAt: post.firstPublishedDate || "",
    updatedAt: post.lastPublishedDate || post.firstPublishedDate || "",
    sourceUrl,
    coverImage,
    coverWidth:
      coverImage && Number.isFinite(coverDimensions?.width) ? coverDimensions.width : null,
    coverHeight:
      coverImage && Number.isFinite(coverDimensions?.height) ? coverDimensions.height : null,
    minutesToRead: Number.isFinite(post.minutesToRead)
      ? post.minutesToRead
      : Math.max(1, Math.ceil((post.contentText || "").split(/\s+/).length / 200)),
    categoryIds: Array.isArray(post.categoryIds) ? post.categoryIds : [],
    seoTitle: titleTag?.children || null,
    seoDescription: descriptionTag?.props?.content || null,
  };
}

function packArchive(value) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  let binary = encoded.replace(/%([0-9A-F]{2})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16)),
  );
  const dictionary = new Map();
  let nextCode = 256;
  let current = "";
  const codes = [];
  for (let index = 0; index < binary.length; index += 1) {
    const character = binary[index];
    const combined = current + character;
    if (combined.length === 1 || dictionary.has(combined)) {
      current = combined;
    } else {
      codes.push(current.length === 1 ? current.charCodeAt(0) : dictionary.get(current));
      if (nextCode < 65536) dictionary.set(combined, nextCode++);
      current = character;
    }
  }
  if (current) codes.push(current.length === 1 ? current.charCodeAt(0) : dictionary.get(current));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = [];
  for (const code of codes) bytes.push(code & 255, code >>> 8);
  let base64 = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const value = (first << 16) | ((second || 0) << 8) | (third || 0);
    base64 +=
      alphabet[(value >>> 18) & 63] +
      alphabet[(value >>> 12) & 63] +
      (second === undefined ? "=" : alphabet[(value >>> 6) & 63]) +
      (third === undefined ? "=" : alphabet[value & 63]);
  }
  return {
    encoding: "lzw16le-base64-utf8-json",
    originalCharacters: binary.length,
    packedCharacters: base64.length,
    data: base64,
  };
}

export { normalizeWixPost, packArchive };
