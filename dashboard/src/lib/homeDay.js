/** Прогресс сессии за календарный день (localStorage). */

export function calendarTodayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayKey(slug) {
  return `force_home_day_${slug}`
}

function readAll(slug) {
  try {
    const raw = localStorage.getItem(dayKey(slug))
    const data = raw ? JSON.parse(raw) : {}
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function writeAll(slug, data) {
  try {
    localStorage.setItem(dayKey(slug), JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function loadHomeDay(slug, iso = calendarTodayIso()) {
  const all = readAll(slug)
  const row = all[iso] || {}
  return {
    iso,
    items: Array.isArray(row.items) ? row.items.map(String) : [],
    stamp: Boolean(row.stamp),
  }
}

export function saveHomeDay(slug, { items, stamp }, iso = calendarTodayIso()) {
  const all = readAll(slug)
  all[iso] = {
    items: [...new Set((items || []).map(String))],
    stamp: Boolean(stamp),
  }
  const keys = Object.keys(all).sort()
  if (keys.length > 90) {
    for (const k of keys.slice(0, keys.length - 90)) delete all[k]
  }
  writeAll(slug, all)
  return loadHomeDay(slug, iso)
}

export function starFillFromProgress(doneCount, planCount, stamped) {
  if (planCount <= 0) return stamped ? 5 : 0
  const ratio = Math.min(1, doneCount / planCount)
  if (ratio >= 1 || (stamped && doneCount >= planCount)) return 5
  return ratio * 5
}

export function planItemKey(index, name) {
  return `${index}:${name}`
}
