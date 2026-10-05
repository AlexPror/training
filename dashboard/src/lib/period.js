/** Период просмотра журнала (FORCE). Даты журнала часто DD.MM → ISO через year. */

const STORAGE_KEY = 'force_period'

export function calendarToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** '26.09' | '26.09.26' | '2026-09-26' → ISO */
export function toIsoDate(label, year = 2026) {
  if (!label) return null
  const s = String(label).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m = s.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/)
  if (!m) return null
  const dd = m[1].padStart(2, '0')
  const mm = m[2].padStart(2, '0')
  let y = year
  if (m[3]) y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])
  return `${y}-${mm}-${dd}`
}

export function formatDay(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return String(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${String(d.getFullYear()).slice(-2)}`
}

export function periodLabel(startIso, endIso) {
  return `${formatDay(startIso)} — ${formatDay(endIso)}`
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d
}

export function toIso(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function mondayOf(iso) {
  const d = new Date(`${iso}T00:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toIso(d)
}

export function inPeriod(isoOrLabel, period, year = 2026) {
  if (!period?.startIso || !period?.endIso) return true
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(isoOrLabel)
    ? isoOrLabel
    : toIsoDate(isoOrLabel, year)
  if (!iso) return true
  return iso >= period.startIso && iso <= period.endIso
}

export const PERIOD_PRESETS = [
  { id: 'weeks4', label: '4 недели' },
  { id: 'weeks2', label: '2 недели' },
  { id: 'week', label: 'Эта неделя' },
  { id: 'all', label: 'Весь журнал' },
  { id: 'custom', label: 'Свой' },
]

/**
 * @param {{ dates?: string[], trackFrom?: string }} ctx — ISO или DD.MM
 * @param {{ mode: string, from?: string, to?: string }} selection
 */
export function resolvePeriod(ctx, selection, todayIso) {
  const today = todayIso || calendarToday()
  const mode = selection?.mode || 'weeks4'
  const raw = (ctx?.dates || []).map((d) => toIsoDate(d) || d).filter(Boolean).sort()
  const trackFrom = ctx?.trackFrom ? toIsoDate(ctx.trackFrom) || ctx.trackFrom : null
  const minDate = raw[0] || trackFrom || today
  const maxDate = raw[raw.length - 1] || today

  function clipStart(startIso) {
    if (trackFrom && startIso < trackFrom) return trackFrom
    return startIso
  }

  if (mode === 'all') {
    const startIso = clipStart(minDate)
    const endIso = maxDate > today ? maxDate : today
    return { mode, startIso, endIso, label: periodLabel(startIso, endIso), weeks: null }
  }

  if (mode === 'custom' && selection.from && selection.to) {
    let startIso = selection.from <= selection.to ? selection.from : selection.to
    let endIso = selection.from <= selection.to ? selection.to : selection.from
    startIso = clipStart(startIso)
    return { mode, startIso, endIso, label: periodLabel(startIso, endIso), weeks: null }
  }

  if (mode === 'week') {
    let startIso = clipStart(mondayOf(today))
    const endIso = toIso(addDays(mondayOf(today), 6))
    if (startIso > endIso) startIso = endIso
    return { mode, startIso, endIso, label: periodLabel(startIso, endIso), weeks: 1 }
  }

  const weeks = mode === 'weeks2' ? 2 : 4
  const endIso = today
  let startIso = clipStart(toIso(addDays(endIso, -(weeks * 7 - 1))))
  return {
    mode: mode === 'weeks2' ? 'weeks2' : 'weeks4',
    startIso,
    endIso,
    label: periodLabel(startIso, endIso),
    weeks,
  }
}

export function readPeriodSelection(slug) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${slug}`)
    if (!raw) return { mode: 'weeks4' }
    return JSON.parse(raw)
  } catch {
    return { mode: 'weeks4' }
  }
}

export function writePeriodSelection(slug, selection) {
  localStorage.setItem(`${STORAGE_KEY}:${slug}`, JSON.stringify(selection))
}
