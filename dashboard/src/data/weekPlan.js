/** Неделя плана v1.10 — гири + разборные гантели 2×20 кг (прогрессия силы).
 *  key = getDay(): 0=Вс … 6=Сб
 */

export const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
export const WEEKDAY_LONG = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
]

/** Порядок отображения сетки: Пн→Вс */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

/**
 * Сила (низкие повторы, прогрессия кг): гантели / штанга.
 * Сила-выносливость / навык: гири (толчок, ДЦ, Кляйн, рывок) — не «пусто», но не 1ПМ.
 */
export const EQUIPMENT_NOTE =
  'Гантели 2× до 20 кг — жим/тяга/RDL в силовом диапазоне 6–12. Гири — кондиция и навык (Сб, добавки). Штанга — когда 2×20 станет легко на 8–10.'

export const WEEK_PLAN = {
  1: {
    id: 'A',
    title: 'Сила A',
    kind: 'A',
    walk: '≥4000',
    durationMin: 80,
    timerPreset: 'strength80',
    blurb: 'Верх + кор. Жим/тяга — гантели (сила). Гири — опция. К 19:00.',
    items: [
      { name: 'Жим гантелей лёжа / наклон', dose: '3–4×6–10 · 2×12–20 кг' },
      { name: 'Тяга гантели к поясу', dose: '3–4×8–12 / рука' },
      { name: 'Отжимания или Кляйн (лёгкий)', dose: '2–3×8–15' },
      { name: 'Dead bug', dose: '3×6–8/стор' },
      { name: 'Планка', dose: '3×20–40 с' },
      { name: 'Римский стул ур.1', dose: '2–3×20–40 с изо' },
      { name: 'Прогулка после', dose: '15–25 мин' },
    ],
  },
  2: {
    id: 'walkTue',
    title: 'Ходьба + верх легко',
    kind: 'easy',
    walk: '≥7000–9000',
    durationMin: 50,
    timerPreset: 'easy50',
    blurb: 'Основной день ходьбы. Верх ~15 мин, RIR 3–4.',
    items: [
      { name: 'Ходьба', dose: '40–60 мин' },
      { name: 'Подтягивания / негативы', dose: '3×3–5 · RIR 3–4' },
      { name: 'Отжимания', dose: '3×8–12' },
      { name: 'Мобилити бедро / QL', dose: '5–8 мин' },
    ],
  },
  3: {
    id: 'B',
    title: 'Сила B',
    kind: 'B',
    walk: '≥4000',
    durationMin: 80,
    timerPreset: 'strength80',
    blurb: 'Ноги / таз. RDL — 2 гантели (цель 8–12, не 20 «лёгких»). Чулки по нужде.',
    items: [
      { name: 'Goblet / фронт squat (гантель или гиря)', dose: '3–4×8–12' },
      { name: 'RDL 2×гантели', dose: '3×8–12 · до 2×20 кг, темп 3с вниз' },
      { name: 'Hip thrust / мост + гантель на таз', dose: '3–4×10–15' },
      { name: 'Step-up с гантелями', dose: '3×8–12/нога' },
      { name: 'Икры', dose: '3×12–15' },
      { name: 'Side plank', dose: '2×20–30 с/стор' },
    ],
  },
  4: {
    id: 'walkThu',
    title: 'Верх легко + ходьба',
    kind: 'easy',
    walk: '≥6000–8000',
    durationMin: 50,
    timerPreset: 'easy50',
    blurb: 'Качество подтяг/отжим, не отказ. Лучший день техники.',
    items: [
      { name: 'Подтягивания', dose: '4×3–6 · RIR 3–4' },
      { name: 'Отжимания', dose: '3×10–15' },
      { name: 'Dead bug', dose: '2×6' },
      { name: 'Ходьба / сад', dose: 'до нормы шагов' },
    ],
  },
  5: {
    id: 'C',
    title: 'Сила C',
    kind: 'C',
    walk: '≥4000',
    durationMin: 80,
    timerPreset: 'strength80',
    blurb: 'Верх + farmer. Закончить к 19:00. После — 15–20 мин ходьбы.',
    items: [
      { name: 'Отжимания', dose: '3–4 подхода' },
      { name: 'Подтягивания / негативы', dose: '3–5×3–6' },
      { name: 'Farmer (гантели или гири)', dose: '2–3×40–80 шагов' },
      { name: 'Мост лёгкий или римский ур.1–2', dose: '3×12 / изо' },
      { name: 'Dead bug', dose: '2×6' },
      { name: 'Ходьба после', dose: '15–20 мин' },
    ],
  },
  6: {
    id: 'sat',
    title: 'Кондиция / гири (+ добор)',
    kind: 'easy',
    walk: '≥5000–7000',
    durationMin: 60,
    timerPreset: 'cond60',
    blurb: 'Гири = навык/кондиция, не max-сила. Можно добрать farmer/мост с Пт.',
    items: [
      { name: 'Разминка / ходьба', dose: '5–25 мин' },
      { name: 'Умные гири (толчок/ДЦ/махи) — опц.', dose: '12–25 мин, не отказ' },
      { name: 'Farmer гантели/гири', dose: '3×60–80 шагов' },
      { name: 'Мост / hip thrust', dose: '3×10–15' },
      { name: 'Dead bug', dose: '2×8–10' },
    ],
  },
  0: {
    id: 'rest',
    title: 'Ходьба / без силовой',
    kind: 'rest',
    walk: '≥6000–8000',
    durationMin: 0,
    timerPreset: 'walk20',
    blurb: 'Семейная прогулка = тренировка. Без A/B/C. Без догона объёма.',
    items: [
      { name: 'Семейная прогулка', dose: '≥6000–8000 шагов / ~40–60 мин' },
      { name: 'Мобилити (опц.)', dose: '5–10 мин' },
    ],
  },
}
export function planForWeekday(weekday) {
  return WEEK_PLAN[weekday] || WEEK_PLAN[0]
}

export function planForDate(d = new Date()) {
  return planForWeekday(d.getDay())
}

export function calendarTodayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Понедельник текущей недели (ISO) */
export function mondayOfIso(iso) {
  const d = new Date(`${iso}T00:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function weekdayFromIso(iso) {
  return new Date(`${iso}T00:00:00`).getDay()
}

export function formatIsoShort(iso) {
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}
