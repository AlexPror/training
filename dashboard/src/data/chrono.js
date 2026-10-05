/** Parse labels like "11.08", "21.09 GTG", "2026-09-21" → sortable number (same year). */
export function chronoKey(label) {
  const s = String(label)
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return Number(iso[1]) * 10000 + Number(iso[2]) * 100 + Number(iso[3])
  const dm = s.match(/(\d{1,2})\.(\d{1,2})/)
  if (dm) return Number(dm[2]) * 100 + Number(dm[1])
  return 0
}

/** Oldest → newest (left → right on charts). */
export function byChrono(rows, getLabel = (r) => r.label ?? r.date) {
  return [...rows].sort((a, b) => chronoKey(getLabel(a)) - chronoKey(getLabel(b)))
}
