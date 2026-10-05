/**
 * Оценка расхода активности (без шагомера).
 * Формула: MET × вес_кг × часы (классический MET).
 *
 * Длительность по умолчанию: сила A/B/C ≈ 80 мин;
 * лёгкий день ≈ 50 мин; отдых 0.
 * Переопределение: trainRow.min, walkMin, burnKcal.
 */

const DEFAULT_MIN = {
  A: 80,
  B: 80,
  C: 80,
  easy: 50,
  rest: 0,
}

/** MET для домашней силы с паузами / лёгкого / прогулки */
const MET = {
  A: 5.5,
  B: 5.5,
  C: 5.5,
  easy: 4.0,
  rest: 1.0,
  walk: 3.2,
}

function roundKcal(n) {
  return Math.round(n / 10) * 10
}

export function sessionMinutes(row) {
  if (row.min != null && row.min >= 0) return row.min
  return DEFAULT_MIN[row.kind] ?? 50
}

export function estimateRowBurn(row, bodyweightKg) {
  if (row.burnKcal != null) {
    return {
      total: Math.round(row.burnKcal),
      session: Math.round(row.burnKcal),
      walk: 0,
      min: sessionMinutes(row),
      walkMin: row.walkMin || 0,
      source: 'manual',
    }
  }

  const kg = bodyweightKg || 97
  const min = sessionMinutes(row)
  const walkMin = row.walkMin || 0
  const met = MET[row.kind] ?? 4

  const session = min > 0 ? met * kg * (min / 60) : 0
  const walk = walkMin > 0 ? MET.walk * kg * (walkMin / 60) : 0
  const total = session + walk

  return {
    total: roundKcal(total),
    session: roundKcal(session),
    walk: roundKcal(walk),
    min,
    walkMin,
    source: 'estimate',
  }
}

/**
 * По датам (как в foodRows: '26.09') — суммарный burn за день.
 * Несколько trainRows в один день складываются.
 */
export function burnByDate(trainRows, bodyweightKg) {
  const map = new Map()
  for (const row of trainRows) {
    const b = estimateRowBurn(row, bodyweightKg)
    if (!b.total) continue
    const prev = map.get(row.date) || {
      total: 0,
      session: 0,
      walk: 0,
      min: 0,
      walkMin: 0,
      types: [],
    }
    map.set(row.date, {
      total: prev.total + b.total,
      session: prev.session + b.session,
      walk: prev.walk + b.walk,
      min: prev.min + b.min,
      walkMin: prev.walkMin + b.walkMin,
      types: [...prev.types, row.type],
    })
  }
  return map
}

/**
 * Ряд для графика: выравнивание по labels дат (DD.MM).
 * Дни без активности → null (разрыв линии).
 */
export function burnSeriesForLabels(labels, trainRows, bodyweightKg) {
  const map = burnByDate(trainRows, bodyweightKg)
  return labels.map((label) => {
    const hit = map.get(label)
    return hit ? hit.total : null
  })
}

export function burnGuideNote(bodyweightKg) {
  const kg = Math.round(bodyweightKg || 97)
  const strength = roundKcal(MET.A * kg * (80 / 60))
  const walk3h = roundKcal(MET.walk * kg * 3)
  return (
    `Оценка без шагомера: сила ~80 мин ≈ ${strength} ккал; ` +
    `прогулка 3 ч ≈ ${walk3h} ккал (вес ${kg} кг, MET).`
  )
}

export { DEFAULT_MIN, MET }
