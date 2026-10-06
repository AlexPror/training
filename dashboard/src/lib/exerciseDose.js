/**
 * Привязка доз из TRAIN_LOADS к точкам графиков упражнений.
 */
import { TRAIN_LOADS } from '@/data/trainLoads'
import { tonnageFromDose } from '@/lib/tonnage'

const EX_ALIASES = {
  press: ['Жим 2×16', 'Жим наклон', 'Жим'],
  row: ['Тяга'],
  rdl: ['RDL'],
  klein: ['Кляйна', 'Klein'],
  bridge: ['Мост'],
  clean: ['Взятие', 'ДЦ толчок', 'Толчок'],
  farmer: ['Farmer'],
}

export function doseForPoint(exId, dateLabel) {
  const loads = TRAIN_LOADS[dateLabel] || []
  if (!loads.length) return ''
  const aliases = EX_ALIASES[exId] || []
  if (!aliases.length) return ''
  const matched = loads.filter((l) =>
    aliases.some((a) => String(l.name).toLowerCase().includes(a.toLowerCase())),
  )
  if (!matched.length) return ''
  // суммарная доза дня по этому движению
  if (matched.length === 1) return matched[0].dose
  return matched.map((m) => m.dose).join(' + ')
}

export function resolvePointDose(exId, point) {
  if (point?.dose) return String(point.dose).trim()
  const fromLoads = doseForPoint(exId, point?.label)
  if (fromLoads) return fromLoads
  const note = point?.note ? String(point.note).trim() : ''
  // note вида «4×25» / «3×10» годится как доза
  if (/\d+\s*[×xх*]/.test(note)) return note
  return ''
}

export function pointMetaFor(exId, point) {
  const dose = resolvePointDose(exId, point)
  const tonnageKg = dose ? tonnageFromDose(dose) : null
  return { dose, tonnageKg, note: point?.note || '' }
}
