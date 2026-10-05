/**
 * Индекс прибавки: +6, −2 кг …
 */
import { parseDose } from './parseDose'
import { TRAIN_LOADS } from '@/data/trainLoads'

export function progressDelta(prev, next, unit = '') {
  if (prev == null || next == null || Number.isNaN(prev) || Number.isNaN(next)) {
    return { abs: null, label: null, tone: 'flat', prev, next }
  }
  const abs = Math.round((next - prev) * 10) / 10
  if (abs === 0) return { abs: 0, label: '0', tone: 'flat', prev, next }
  const sign = abs > 0 ? '+' : ''
  const u = unit ? ` ${unit}` : ''
  return {
    abs,
    label: `${sign}${abs}${u}`.trim(),
    tone: abs > 0 ? 'up' : 'down',
    prev,
    next,
  }
}

/** По точкам графика упражнения (points[{v}]) — к прошлой точке */
export function deltaFromPoints(points, unit = '') {
  if (!points || points.length < 2) return progressDelta(null, null, unit)
  const next = Number(points[points.length - 1].v)
  const prev = Number(points[points.length - 2].v)
  return progressDelta(prev, next, unit)
}

export function exerciseNameKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim()
}

const STEMS = [
  'отжим', 'подтяг', 'жим', 'тяга', 'мост', 'goblet', 'rdl', 'step',
  'фермер', 'farmer', 'кляйн', 'klein', 'икры', 'жук', 'dead', 'roman',
]

export function exerciseNamesMatch(a, b) {
  const ka = exerciseNameKey(a)
  const kb = exerciseNameKey(b)
  if (!ka || !kb) return false
  if (ka === kb) return true
  if (ka.length >= 4 && kb.length >= 4 && (ka.includes(kb) || kb.includes(ka))) return true
  for (const stem of STEMS) {
    if (ka.includes(stem) && kb.includes(stem)) return true
  }
  return false
}

export function doseDelta(prevDose, nextDose) {
  const a = parseDose(prevDose)
  const b = parseDose(nextDose)

  if (a.loadKg != null && b.loadKg != null && a.loadKg !== b.loadKg) {
    return progressDelta(a.loadKg, b.loadKg, 'кг')
  }
  if (a.reps != null && b.reps != null) {
    if ((a.sets || 1) !== (b.sets || 1) && a.reps === b.reps) {
      return progressDelta((a.sets || 1) * a.reps, (b.sets || 1) * b.reps)
    }
    const d = progressDelta(a.reps, b.reps)
    if (d.abs) return d
    return progressDelta((a.sets || 1) * a.reps, (b.sets || 1) * b.reps)
  }
  if (a.seconds != null && b.seconds != null) {
    return progressDelta(a.seconds * (a.sets || 1), b.seconds * (b.sets || 1), 'с')
  }
  if (a.meters != null && b.meters != null) {
    return progressDelta(a.meters, b.meters, 'м')
  }
  return progressDelta(null, null)
}

export function previousExerciseDose(trainRows, name, beforeDate, currentSession = null) {
  const chron = [...(trainRows || [])].sort((a, b) =>
    String(a.date).localeCompare(String(b.date), undefined, { numeric: true }),
  )
  let curIdx = -1
  if (currentSession) {
    curIdx = chron.findIndex(
      (r) =>
        r === currentSession ||
        (r.date === currentSession.date && r.type === currentSession.type),
    )
  }
  for (let i = chron.length - 1; i >= 0; i--) {
    if (curIdx >= 0 && i >= curIdx) continue
    if (curIdx < 0 && String(chron[i].date) >= String(beforeDate)) continue
    const list = chron[i].exercises?.length ? chron[i].exercises : (TRAIN_LOADS[chron[i].date] || [])
    for (const ex of list) {
      if (exerciseNamesMatch(ex.name, name) && ex.dose) return ex.dose
    }
  }
  return null
}

export function annotateSessionExercises(session, trainRows) {
  const list = session?.exercises?.length
    ? session.exercises
    : TRAIN_LOADS[session?.date] || []
  return list.map((e) => {
    const prev = previousExerciseDose(trainRows, e.name, session.date, session)
    const delta = prev ? doseDelta(prev, e.dose) : progressDelta(null, null)
    const show = Boolean(delta.label && delta.abs != null && delta.abs !== 0)
    return { ...e, delta: show ? delta : null, prevDose: prev || null }
  })
}
