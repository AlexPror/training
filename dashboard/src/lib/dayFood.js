import { FOODS, macros } from '@/data/foods'

export function foodById(id) {
  return FOODS.find((f) => f.id === id)
}

/** Как у детей в power_note: items[] → строки + итог БЖУ */
export function dayMacros(day) {
  let kcal = 0
  let p = 0
  let f = 0
  let c = 0
  const rows = []
  for (const item of day.items || []) {
    const food = foodById(item.id)
    if (!food) continue
    const m = macros(food, item.grams)
    kcal += m.kcal
    p += m.p
    f += m.f
    c += m.c
    rows.push({
      id: food.id,
      name: food.name,
      meal: item.meal || '',
      grams: item.grams,
      unitGrams: food.unitGrams,
      unitLabel: food.unitLabel,
      kcal: Math.round(m.kcal),
      p: Math.round(m.p * 10) / 10,
      f: Math.round(m.f * 10) / 10,
      c: Math.round(m.c * 10) / 10,
    })
  }
  return {
    kcal: Math.round(kcal),
    p: Math.round(p * 10) / 10,
    f: Math.round(f * 10) / 10,
    c: Math.round(c * 10) / 10,
    rows,
  }
}

export function amountLabel(row) {
  if (row.unitGrams) return `${row.grams} ${row.unitLabel || 'шт'}`
  return `${row.grams} г`
}

/** DD.MM → YYYY-MM-DD (год из даты или 2026) */
export function toIsoDate(ddmm, year = 2026) {
  const m = String(ddmm).match(/(\d{1,2})\.(\d{1,2})/)
  if (!m) return null
  return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
}

export function fromIsoDate(iso) {
  const m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[3]}.${m[2]}`
}
