import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

// Sanitize AFTER rendering. html:false already blocks raw HTML, but we sanitize
// the generated markup too as defense in depth (XSS is the #1 concern).
const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "del", "blockquote", "ul", "ol", "li",
    "code", "pre", "a", "h1", "h2", "h3", "h4", "h5", "h6", "hr",
    "table", "thead", "tbody", "tr", "th", "td", "img",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "data"],
  // data: only for inline images (in-memory rooms keep images as data URLs)
  allowedSchemesByTag: { img: ["http", "https", "data"], a: ["http", "https", "mailto"] },
  transformTags: {
    a: (tag, attribs) => ({
      tagName: "a",
      attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
    }),
  },
};

export function renderMarkdown(src: string): string {
  return sanitizeHtml(md.render(src ?? ""), SANITIZE);
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}
