/**
 * Тонаж сессии — только снаряд (кг × повт × подходы).
 * Свой вес / статика / кардио / метры farmer без кг — не считаем.
 */
import { parseDose } from './parseDose'
import { loadsForRow } from '@/data/trainLoads'

/** Вытащить блоки «N×N×кг» из свободного текста body */
export function extractLoadChunks(text) {
  if (!text) return []
  const s = String(text)
  const out = []
  const re =
    /(\d+)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)\s*(?:кг)?/gi
  let m
  while ((m = re.exec(s))) {
    out.push({
      name: 'load',
      dose: `${m[1]}×${m[2]} × ${m[3]} кг`,
    })
  }
  // «3×17 × 16 кг» / «4×10 × 28 кг»
  const re2 = /(\d+)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)\s*[×xх*]?\s*(\d+(?:[.,]\d+)?)\s*кг/gi
  while ((m = re2.exec(s))) {
    const dose = `${m[1]}×${m[2]} × ${m[3]} кг`
    if (!out.some((x) => x.dose === dose)) out.push({ name: 'load', dose })
  }
  return out
}

/**
 * @param {{ name?: string, dose?: string }[]} exercises
 */
export function sessionTonnage({ exercises = [] }) {
  let externalKg = 0
  const byName = {}

  for (const row of exercises) {
    const parsed = parseDose(row.dose)
    const kg = parsed.loadKg
    const reps = parsed.reps
    if (!kg || !reps) continue
    // farmer в метрах без кг — пропускаем (meters без load)
    if (parsed.meters != null && !String(row.dose).match(/кг/i) && !kg) continue
    const sets = Math.max(1, parsed.sets || 1)
    const vol = kg * reps * sets
    externalKg += vol
    const key = row.name || 'прочее'
    byName[key] = (byName[key] || 0) + vol
  }

  return {
    totalKg: Math.round(externalKg),
    externalKg: Math.round(externalKg),
    byMovement: Object.fromEntries(
      Object.entries(byName)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => [k, { label: k, kg: Math.round(v) }]),
    ),
  }
}

export function rowTonnage(row) {
  const structured = loadsForRow(row)
  const fromBody = structured.length ? [] : extractLoadChunks(row.body)
  return sessionTonnage({ exercises: structured.length ? structured : fromBody })
}

export function formatTonnageKg(kg) {
  if (kg == null || kg <= 0) return '—'
  if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace('.', ',')} т`
  return `${Math.round(kg)} кг`
}

/** Тонаж одной дозы: кг × повторы × подходы. Несколько блоков через «+» суммируются. */
export function tonnageFromDose(dose) {
  if (dose == null || dose === '') return null
  const parts = String(dose).split(/\s*\+\s*/).filter(Boolean)
  let total = 0
  let any = false
  for (const part of parts) {
    const p = parseDose(part)
    if (!p.loadKg || !p.reps) continue
    any = true
    total += p.loadKg * p.reps * Math.max(1, p.sets || 1)
  }
  return any ? Math.round(total) : null
}

/** Ориентир для домашнего зала со снарядом (не BW) */
export function tonnageGuide(bodyweightKg) {
  const bw = Number(bodyweightKg)
  if (!bw || bw <= 0) return null
  return {
    bodyweightKg: bw,
    softMinKg: Math.round(bw * 15),
    softMaxKg: Math.round(bw * 45),
    note: 'Только вес снаряда × повторы. Лёгкая ≈ 15×BW, плотная ≈ 45×BW.',
  }
}

export function tonnageSeries(trainRows = []) {
  return [...(trainRows || [])]
    .map((r) => {
      const t = rowTonnage(r)
      return {
        date: r.date,
        label: r.date,
        type: r.type,
        totalKg: t.totalKg,
        tonnage: t,
      }
    })
    .filter((p) => p.totalKg > 0)
    .sort((a, b) => String(a.date).localeCompare(String(b.date), undefined, { numeric: true }))
}
