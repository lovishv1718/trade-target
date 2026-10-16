// Client-side search over a small static index. Scores title matches highest.

export type SearchDoc = {
  type: "story" | "ipo" | "calculator";
  title: string;
  href: string;
  label: string;
  text: string;
  date?: string;
};

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9₹.%\s-]/g, " ");

export function searchDocs(docs: SearchDoc[], query: string) {
  const terms = normalise(query).split(/\s+/).filter((t) => t.length > 1 || /\d/.test(t));
  if (!terms.length) return [];
  const scored: { doc: SearchDoc; score: number }[] = [];
  for (const doc of docs) {
    const title = normalise(doc.title);
    const rest = normalise(`${doc.label} ${doc.text}`);
    let score = 0;
    let matchedAll = true;
    for (const t of terms) {
      const inTitle = title.includes(t);
      const inRest = rest.includes(t);
      if (!inTitle && !inRest) {
        matchedAll = false;
        break;
      }
      score += inTitle ? (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title) ? 6 : 4) : 1;
    }
    if (!matchedAll) continue;
    if (title.startsWith(terms[0])) score += 3;
    if (doc.type !== "story") score += 1;
    scored.push({ doc, score });
  }
  return scored.sort((a, b) => b.score - a.score || ((b.doc.date ?? "") > (a.doc.date ?? "") ? 1 : -1)).map((s) => s.doc);
}
