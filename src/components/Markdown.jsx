import React from "react";

// Turns AI markdown into React elements: headings, bold, italic, code and lists.
// Everything renders as plain text nodes, so HTML in a reply never runs.
function renderInline(text, keyBase) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\s][^*]*\*)/g);
  return parts.map((p, i) => {
    const k = keyBase + "-" + i;
    if ((p.startsWith("**") && p.endsWith("**")) || (p.startsWith("__") && p.endsWith("__"))) {
      if (p.length > 4) return <strong key={k}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <code key={k}>{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={k}>{p.slice(1, -1)}</em>;
    return p.replace(/\*\*/g, "");
  });
}

export function Markdown({ text }) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const out = [];
  let list = null;
  const flush = () => {
    if (!list) return;
    const k = "list-" + out.length;
    out.push(list.ordered ? <ol key={k}>{list.items}</ol> : <ul key={k}>{list.items}</ul>);
    list = null;
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || /^[-*_]{3,}$/.test(line)) { flush(); return; }
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { flush(); out.push(<div key={i} className="md-h">{renderInline(h[1].replace(/\*\*/g, ""), i)}</div>); return; }
    const b = line.match(/^[-*•]\s+(.*)$/);
    const n = line.match(/^\d+[.)]\s+(.*)$/);
    if (b || n) {
      const ordered = !!n;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push(<li key={i}>{renderInline((b || n)[1], i)}</li>);
      return;
    }
    flush();
    out.push(<p key={i}>{renderInline(line.replace(/^>\s?/, ""), i)}</p>);
  });
  flush();
  return <div className="md">{out}</div>;
}
