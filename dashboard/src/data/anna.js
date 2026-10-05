export const meta = {
  name: 'Анна',
  updated: '26.09.2026',
  note: 'МТД + силовые дома · без учёта питания',
}

export const health = [
  { name: 'SUI / подтекание', start: 'есть', now: 'следить нагрузку', goal: '↓ частота' },
  { name: '«Домик» на животе', start: 'возможен', now: 'следить в видео', goal: 'нет при нагрузке' },
  { name: 'Хруст ТБС', start: 'dead bug стоп', now: 'пауза dead bug', goal: 'к врачу' },
  { name: 'Лёгкие / кашель', start: 'слабые', now: 'бег короткий', goal: 'без провокации' },
]

export const runRows = [
  { date: '24.08', km: 0.6 },
  { date: '25.08', km: 1.2 },
  { date: '26.08', km: 1.2 },
  { date: '27.08', km: 0.6 },
  { date: '28.08', km: 1.0 },
  { date: '07.09', km: 0.6 },
  { date: '09.09', km: 2.3 },
  { date: '15.09', km: 1.5 },
  { date: '16.09', km: 0.8 },
  { date: '19.09', km: 0.8 },
  { date: '23.09', km: 1.2 },
  { date: '26.09', km: 0.6 },
]

export const trainRows = [
  { date: '24.08', type: 'МТД + верх', body: 'жим 12; гипер 3×10; видео диастаз', mark: 'старт', kind: 'mtd' },
  { date: '25.08', type: 'МТД', body: 'бег 1.2; ролик 15 мин', mark: '✓', kind: 'mtd' },
  { date: '26.08', type: 'Сила B', body: 'goblet/мост 5 кг; RDL 12; step', mark: 'сила ✓', kind: 'B' },
  { date: '27.08', type: 'Лёгкий верх', body: 'трицепс 3 кг; ношение', mark: 'лёгкий', kind: 'easy' },
  { date: '28.08', type: 'Лёгкий Пт', body: 'отжим с колен; подтяг стенка; бок. планка', mark: '✓', kind: 'easy' },
  { date: '07.09', type: 'Верх+', body: 'жим/трицепс 8 кг; ножницы; вело; гипер 3×60', mark: 'объём↑', kind: 'A' },
  { date: '09.09', type: 'Сила B', body: 'мост/goblet 8 кг; RDL 8; наклоны 12', mark: 'B ✓', kind: 'B' },
  { date: '14.09', type: 'Верх', body: 'жим 8+12; трицепс; ножницы; отжим 4×10; тяга к подбородку', mark: '✓', kind: 'A' },
  { date: '15.09', type: 'Бег', body: 'бег 1.5 км', mark: '✓', kind: 'easy' },
  { date: '16.09', type: 'Сила B', body: 'бег 0.8; мост/goblet/RDL 8×3×10; наклоны 12×3×10; step 8кг 3×20', mark: 'B ✓', kind: 'B' },
  { date: '19.09', type: 'Сб гири+Таня', body: 'бег 0.8; гиря вокруг/восьмёрка; с Таней 2×15 мин', mark: '✓', kind: 'easy' },
  { date: '21.09', type: 'Таня', body: 'с Таней 15 мин', mark: '✓', kind: 'easy' },
  { date: '23.09', type: 'Сила B', body: 'бег 1.2; мост/goblet 8×3×10; RDL 12×3×12; наклоны 12×3×12; step 8кг 3×20', mark: 'B ✓✓', kind: 'B' },
  { date: '26.09', type: 'Сб верх', body: 'бег 0.6; трицепс лёжа 8×3×8; жим гири 8×3×10', mark: '✓', kind: 'easy' },
]

export const exercises = [
  {
    id: 'goblet',
    name: 'Goblet squat',
    unit: 'кг',
    current: 8,
    trend: '↑↑',
    color: '#1a6f8a',
    points: [
      { label: '26.08', v: 5 },
      { label: '09.09', v: 8 },
    ],
  },
  {
    id: 'bridge',
    name: 'Мост с гирей',
    unit: 'кг',
    current: 8,
    trend: '↑↑',
    color: '#2a7f9a',
    points: [
      { label: '26.08', v: 5 },
      { label: '09.09', v: 8 },
    ],
  },
  {
    id: 'rdl',
    name: 'RDL',
    unit: 'кг',
    current: 12,
    trend: '↑ вес',
    color: '#3a8a9a',
    points: [
      { label: '26.08', v: 12 },
      { label: '09.09', v: 8 },
      { label: '16.09', v: 8 },
      { label: '23.09', v: 12 },
    ],
  },
  {
    id: 'sidebend',
    name: 'Наклоны',
    unit: 'кг',
    current: 12,
    trend: 'объём↑ 3×12',
    color: '#8a6a5a',
    points: [
      { label: '26.08', v: 12 },
      { label: '09.09', v: 12 },
      { label: '16.09', v: 12 },
      { label: '23.09', v: 12 },
    ],
  },
  {
    id: 'press',
    name: 'Жим лёжа',
    unit: 'кг × повт',
    current: 8,
    trend: 'рабочий',
    color: '#4a5a7e',
    points: [
      { label: '24.08', v: 12 },
      { label: '07.09', v: 8 },
      { label: '14.09', v: 12 },
      { label: '26.09', v: 8 },
    ],
  },
  {
    id: 'triceps',
    name: 'Трицепс',
    unit: 'кг',
    current: 8,
    trend: '↑↑',
    color: '#5a6a8e',
    points: [
      { label: '27.08', v: 3 },
      { label: '07.09', v: 8 },
      { label: '14.09', v: 8 },
      { label: '26.09', v: 8 },
    ],
  },
  {
    id: 'hyper',
    name: 'Гипер изометрия',
    unit: 'сек × подходы',
    current: 180,
    trend: 'осторожно',
    color: '#6e5a4a',
    points: [
      { label: '24.08', v: 30 },
      { label: '07.09', v: 180 },
    ],
  },
  {
    id: 'run',
    name: 'Пробежка+ход',
    unit: 'км',
    current: 1.2,
    trend: '↑',
    color: '#4a6e5a',
    points: runRows.map((r) => ({ label: r.date, v: r.km })),
  },
]

export const liftSnapshot = [
  { name: 'Goblet', kg: 8 },
  { name: 'Мост', kg: 8 },
  { name: 'RDL', kg: 12 },
  { name: 'Наклоны', kg: 12 },
  { name: 'Step-up', kg: 8 },
  { name: 'Жим', kg: 8 },
]
