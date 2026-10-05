/**
 * Разбор дозы: «4×10 × 28 кг», «3×12», «4×10×28».
 */
export function parseDose(dose) {
  const empty = { sets: 1, reps: null, loadKg: null, seconds: null, minutes: null, meters: null }
  if (dose == null) return empty
  const s = String(dose).trim()
  if (!s || s === '+' || s === '—' || s === '-') return empty

  const kg = s.match(/(\d+(?:[.,]\d+)?)\s*кг/i)
  const meters = s.match(/(\d+(?:[.,]\d+)?)\s*м(?![а-яёa-z])/i)
  const secs = s.match(/(\d+)\s*(?:сек(?:унд)?|с)(?![а-яёa-z])/i)
  const mins = s.match(/(\d+(?:[.,]\d+)?)\s*мин/i)

  // 4×10×28 — третье число = кг
  const triple = s.match(/(\d+)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)/i)
  if (triple) {
    const a = Number(triple[1])
    const b = Number(String(triple[2]).replace(',', '.'))
    const c = Number(String(triple[3]).replace(',', '.'))
    const loadFromKg = kg ? Number(kg[1].replace(',', '.')) : null
    // если есть «кг» в строке — c может быть повтором другого блока; приоритет явного кг
    return {
      sets: a,
      reps: b,
      loadKg: loadFromKg ?? c,
      seconds: secs ? Number(secs[1]) : null,
      minutes: mins ? Number(mins[1].replace(',', '.')) : null,
      meters: meters ? Number(meters[1].replace(',', '.')) : null,
    }
  }

  const multi = s.match(/(\d+)\s*[×xх*]\s*(\d+(?:[.,]\d+)?)/i)
  if (multi) {
    return {
      sets: Number(multi[1]),
      reps: Number(String(multi[2]).replace(',', '.')),
      loadKg: kg ? Number(kg[1].replace(',', '.')) : null,
      seconds: secs ? Number(secs[1]) : null,
      minutes: mins ? Number(mins[1].replace(',', '.')) : null,
      meters: meters ? Number(meters[1].replace(',', '.')) : null,
    }
  }

  if (secs && !multi) return { ...empty, seconds: Number(secs[1]), sets: 1 }
  if (mins && !multi) return { ...empty, minutes: Number(mins[1].replace(',', '.')), sets: 1 }

  const bare = s.match(/(\d+(?:[.,]\d+)?)/)
  return {
    ...empty,
    reps: bare ? Number(bare[1].replace(',', '.')) : null,
    loadKg: kg ? Number(kg[1].replace(',', '.')) : null,
    meters: meters ? Number(meters[1].replace(',', '.')) : null,
  }
}
