<script setup>
import { computed, ref, watch } from 'vue'
import RingProgress from '@/components/RingProgress.vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
import TonnageTrend from '@/components/TonnageTrend.vue'
import TonnageStrip from '@/components/TonnageStrip.vue'
import ProgressBadge from '@/components/ProgressBadge.vue'
import ChartSheet from '@/components/ChartSheet.vue'
import PeriodPicker from '@/components/PeriodPicker.vue'
import { LineChart, DoughnutChart, RadarChart } from '@/components/Charts'
import {
  meta,
  weightRows,
  trainRows,
  foodRows,
  exercises,
  summary,
} from '@/data/alexander'
import { byChrono } from '@/data/chrono'
import { rowTonnage, formatTonnageKg, tonnageSeries } from '@/lib/tonnage'
import { annotateSessionExercises } from '@/lib/progressDelta'
import {
  estimateRowBurn,
  burnSeriesForLabels,
  burnGuideNote,
} from '@/lib/activityBurn'
import { inPeriod } from '@/lib/period'

const s = summary()
const period = ref(null)
const sessionSearch = ref('')

const journalDates = [
  ...trainRows.map((t) => t.date),
  ...foodRows.map((f) => f.date),
  ...weightRows.map((w) => w.date || w.label),
]

const trainInPeriod = computed(() => {
  if (!period.value) return trainRows
  return trainRows.filter((t) => inPeriod(t.date, period.value))
})

const fullFood = computed(() => {
  let rows = byChrono(
    foodRows.filter((r) => r.kcalMid >= 1500),
    (r) => r.date,
  )
  if (period.value) rows = rows.filter((r) => inPeriod(r.date, period.value))
  return rows
})

const weightChrono = computed(() => {
  let rows = byChrono(weightRows)
  if (period.value) {
    rows = rows.filter((r) => inPeriod(r.date || r.label, period.value))
  }
  return rows
})

const weightLabels = computed(() => weightChrono.value.map((r) => r.label))
const weightDatasets = computed(() => [{
  label: 'кг',
  data: weightChrono.value.map((r) => r.kg),
  borderColor: '#0a7a5c',
  backgroundColor: '#0a7a5c22',
  fill: true,
  tension: 0.35,
  pointRadius: 4,
  pointBackgroundColor: '#0a7a5c',
}])

const foodLabels = computed(() => fullFood.value.map((r) => r.date))
const proteinDatasets = computed(() => [{
  label: 'Белок г',
  data: fullFood.value.map((r) => r.proteinMid),
  borderColor: '#0a7a5c',
  backgroundColor: '#0a7a5c22',
  fill: true,
  tension: 0.3,
  pointRadius: 2,
}])

const burnValues = computed(() =>
  burnSeriesForLabels(foodLabels.value, trainInPeriod.value, s.lastKg),
)
const burnHint = computed(() => burnGuideNote(s.lastKg))

const kcalDatasets = computed(() => {
  const burnData = burnValues.value
  return [
    {
      label: 'Еда',
      data: fullFood.value.map((r) => r.kcalMid),
      borderColor: '#c45c28',
      backgroundColor: '#c45c2822',
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointBackgroundColor: '#c45c28',
    },
    {
      label: 'Активность ≈',
      data: burnData,
      borderColor: '#1a6f8a',
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.25,
      spanGaps: false,
      pointRadius: burnData.map((v) => (v != null ? 4 : 0)),
      pointBackgroundColor: '#1a6f8a',
      borderDash: [5, 4],
    },
  ]
})
const kcalChartMax = computed(() => {
  const intake = fullFood.value.map((r) => r.kcalMid)
  const burn = burnValues.value.filter((v) => v != null)
  const m = Math.max(...intake, ...(burn.length ? burn : [0]), 2200)
  return Math.ceil(m / 100) * 100 + 100
})

const sheet = ref(null)
function openSheet(payload) {
  sheet.value = payload
}

const kindOrder = ['A', 'B', 'C', 'easy', 'rest']
const kindLabels = { A: 'Сила A', B: 'Сила B', C: 'Сила C', easy: 'Лёгкий', rest: 'Отдых' }
const kindColors = ['#0a7a5c', '#1a6f8a', '#c45c28', '#5a8a6a', '#a0aea8']

const kindsInPeriod = computed(() =>
  trainInPeriod.value.reduce((acc, t) => {
    acc[t.kind] = (acc[t.kind] || 0) + 1
    return acc
  }, {}),
)
const doughnutValues = computed(() => kindOrder.map((k) => kindsInPeriod.value[k] || 0))

const sessionFilter = ref('all')
const filterChips = computed(() => {
  const counts = kindsInPeriod.value
  const n = trainInPeriod.value.length
  return [
    { id: 'all', label: 'Все', count: n },
    ...kindOrder
      .filter((k) => counts[k])
      .map((k) => ({ id: k, label: kindLabels[k], count: counts[k] })),
  ]
})

function sessionKey(t) {
  return `${t.date}::${t.type}`
}

const sessions = computed(() => {
  const all = [...trainInPeriod.value].reverse()
  let filtered = sessionFilter.value === 'all'
    ? all
    : all.filter((t) => t.kind === sessionFilter.value)
  const q = sessionSearch.value.trim().toLowerCase()
  if (q) {
    filtered = filtered.filter(
      (t) =>
        t.body.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.mark.toLowerCase().includes(q),
    )
  }
  return filtered.map((t) => {
    const tonnage = rowTonnage(t)
    const annotated = annotateSessionExercises(t, trainRows)
    const burn = estimateRowBurn(t, s.lastKg)
    return { ...t, tonnage, annotated, burn, key: sessionKey(t) }
  })
})

const openSession = ref(null)
watch(
  sessions,
  (list) => {
    if (!list.length) {
      openSession.value = null
      return
    }
    if (!list.some((t) => t.key === openSession.value)) {
      openSession.value = list[0].key
    }
  },
  { immediate: true },
)

watch(sessionFilter, () => {
  openSession.value = sessions.value[0]?.key || null
})

function toggleSession(key) {
  openSession.value = openSession.value === key ? null : key
}

const radarValues = computed(() => [
  Math.min(5, kindsInPeriod.value.A || 0),
  Math.min(5, kindsInPeriod.value.B || 0),
  Math.min(5, kindsInPeriod.value.C || 0),
  Math.min(5, kindsInPeriod.value.easy || 0),
  Math.min(5, fullFood.value.filter((r) => r.proteinMid >= 150).length / 4),
])

const tonnagePts = computed(() => tonnageSeries(trainInPeriod.value))
const lastTonnage = computed(() => tonnagePts.value.at(-1)?.totalKg || 0)

const pullExBase = exercises.find((e) => e.id === 'pull')
const pullEx = computed(() => {
  if (!period.value || !pullExBase) return pullExBase
  const pts = (pullExBase.points || []).filter((p) => inPeriod(p.label, period.value))
  if (!pts.length) return pullExBase
  const last = pts[pts.length - 1]
  return { ...pullExBase, points: pts, current: last.v, currentLabel: last.note || pullExBase.currentLabel }
})

const last = trainRows[trainRows.length - 1]

const layers = [
  { id: 'pull', title: 'Тяга / турник', ids: ['pull', 'pullVol', 'row'] },
  { id: 'push', title: 'Жим / отжим', ids: ['push', 'press', 'klein'] },
  { id: 'legs', title: 'Ноги / hinge', ids: ['rdl', 'goblet', 'bridge', 'farmer'] },
  { id: 'core', title: 'Кор / прочее', ids: ['roman', 'deadbug', 'clean'] },
]
const openLayer = ref({ pull: true, push: false, legs: true, core: false })

const exercisesInPeriod = computed(() =>
  exercises.map((ex) => {
    if (!period.value) return ex
    const pts = (ex.points || []).filter((p) => inPeriod(p.label, period.value))
    if (!pts.length) return { ...ex, points: [] }
    const lastPt = pts[pts.length - 1]
    return {
      ...ex,
      points: pts,
      current: lastPt.v,
      currentLabel: lastPt.note || ex.currentLabel,
    }
  }),
)

function exInLayer(layer) {
  return exercisesInPeriod.value.filter((e) => layer.ids.includes(e.id) && e.points?.length)
}
</script>

<template>
  <div class="athlete-page">
    <div class="gym-hero">
      <div>
        <p class="eyebrow">Athlete · план v1.9</p>
        <h1 class="page-title">{{ meta.name }}</h1>
        <p class="page-sub">Сила · тонаж снаряда · питание · обновлено {{ meta.updated }}</p>
      </div>
      <div class="gym-hero-kpis">
        <div class="gym-kpi">
          <span class="lbl">Вес</span>
          <strong>{{ s.lastKg }}</strong>
          <span class="hint delta-down">{{ s.delta }} кг</span>
        </div>
        <div class="gym-kpi accent">
          <span class="lbl">Тонаж</span>
          <strong>{{ formatTonnageKg(lastTonnage) }}</strong>
          <span class="hint">в периоде</span>
        </div>
        <div class="gym-kpi">
          <span class="lbl">Белок</span>
          <strong>{{ s.avgProtein }}</strong>
          <span class="hint">{{ meta.targetProtein.join('–') }}</span>
        </div>
        <div class="gym-kpi">
          <span class="lbl">Сессия</span>
          <strong class="sm">{{ last?.mark || '—' }}</strong>
          <span class="hint">{{ last?.date }} · {{ last?.type }}</span>
        </div>
      </div>
    </div>

    <PeriodPicker
      slug="alexander"
      :dates="journalDates"
      track-from="2026-08-11"
      @update:period="period = $event"
    />

    <div class="section-label group-gap">
      <h2>Volume</h2>
      <span class="hint">только снаряд · кг×повт</span>
    </div>
    <TonnageTrend :train-rows="trainInPeriod" :bodyweight-kg="s.lastKg" />

    <div class="section-label group-gap">
      <h2>Цели</h2>
      <span class="hint">кольца прогресса</span>
    </div>
    <div class="grid grid-2">
      <div class="panel gym-panel">
        <h2>Подтягивания → 25×1</h2>
        <RingProgress
          :value="pullEx.current"
          :max="meta.pullGoal"
          label="Макс. один подход"
          :sub="pullEx.currentLabel"
        />
        <p class="note">Цель — 25 чистых в одном подходе. Объём лесенки — путь, не метрика цели.</p>
      </div>
      <div class="panel gym-panel">
        <h2>Вес · белок</h2>
        <button
          type="button"
          class="chart-hit"
          aria-label="Открыть график веса"
          @click="openSheet({
            title: 'Вес тела',
            subtitle: 'кг',
            labels: weightLabels,
            datasets: weightDatasets,
            suggestedMin: 80,
            suggestedMax: 104,
            hint: `${s.lastKg} кг · Δ ${s.delta} кг`,
          })"
        >
          <div class="chart-box">
            <LineChart :labels="weightLabels" :datasets="weightDatasets" :suggested-min="80" :suggested-max="104" />
          </div>
          <span class="chart-hit-hint">нажми — крупнее</span>
        </button>
        <div style="margin-top:1rem">
          <RingProgress
            :value="Math.min(s.avgProtein, 180)"
            :max="170"
            label="Белок к коридору"
            sub="среднее по полным дням"
          />
        </div>
      </div>
    </div>

    <div class="group-gap">
      <div class="section-label">
        <h2>Сессии</h2>
        <span class="hint">{{ sessions.length }} · одна открыта</span>
      </div>
      <div class="session-filters" role="tablist" aria-label="Фильтр сессий">
        <button
          v-for="chip in filterChips"
          :key="chip.id"
          type="button"
          class="session-chip"
          role="tab"
          :aria-selected="sessionFilter === chip.id"
          :data-active="sessionFilter === chip.id ? '1' : null"
          @click="sessionFilter = chip.id"
        >
          {{ chip.label }}
          <span class="session-chip-n">{{ chip.count }}</span>
        </button>
      </div>
      <input
        v-model="sessionSearch"
        type="search"
        class="session-search"
        placeholder="Поиск: farmer, лесенка, мост…"
        aria-label="Поиск по сессиям"
      />
      <div class="session-cards">
        <article
          v-for="t in sessions"
          :key="t.key"
          class="session-card"
          :data-open="openSession === t.key ? '1' : null"
        >
          <button
            type="button"
            class="session-card-toggle"
            :aria-expanded="openSession === t.key"
            @click="toggleSession(t.key)"
          >
            <div class="session-card-head">
              <div>
                <span class="session-date">{{ t.date }}</span>
                <span class="session-type">{{ t.type }}</span>
              </div>
              <div class="session-card-end">
                <span v-if="t.burn.total" class="session-ton-mini" title="оценка расхода">≈{{ t.burn.total }} ккал</span>
                <span v-if="t.tonnage.totalKg" class="session-ton-mini">{{ formatTonnageKg(t.tonnage.totalKg) }}</span>
                <span class="session-mark">{{ t.mark }}</span>
                <span class="session-chevron" aria-hidden="true">{{ openSession === t.key ? '▾' : '▸' }}</span>
              </div>
            </div>
            <p v-if="openSession !== t.key" class="session-preview">{{ t.body }}</p>
          </button>
          <div v-show="openSession === t.key" class="session-panel">
            <p class="session-body">{{ t.body }}</p>
            <p v-if="t.burn.total" class="session-burn-line">
              Расход ≈ <strong>{{ t.burn.total }} ккал</strong>
              <template v-if="t.burn.min"> · тренировка {{ t.burn.min }} мин</template>
              <template v-if="t.burn.walkMin"> · прогулка {{ t.burn.walkMin }} мин (≈{{ t.burn.walk }})</template>
            </p>
            <TonnageStrip v-if="t.tonnage.totalKg" :tonnage="t.tonnage" />
            <ul v-if="t.annotated.length" class="session-ex">
              <li v-for="(e, i) in t.annotated" :key="i">
                <span>{{ e.name }}</span>
                <span class="dose">{{ e.dose }}</span>
                <ProgressBadge
                  v-if="e.delta"
                  :label="e.delta.label"
                  :tone="e.delta.tone"
                />
              </li>
            </ul>
          </div>
        </article>
        <p v-if="!sessions.length" class="hint-line">
          {{ sessionSearch || sessionFilter !== 'all' ? 'Ничего не найдено — сбрось фильтр или поиск.' : 'Нет сессий в этом периоде.' }}
        </p>
      </div>
    </div>

    <div class="group-gap">
      <div class="section-label">
        <h2>Упражнения</h2>
        <span class="hint">слои · бейдж к прошлому замеру</span>
      </div>
      <div v-for="layer in layers" :key="layer.id" class="chart-layer">
        <button
          type="button"
          class="chart-layer-toggle"
          :aria-expanded="openLayer[layer.id]"
          @click="openLayer[layer.id] = !openLayer[layer.id]"
        >
          <span>{{ layer.title }}</span>
          <span class="meta-line">{{ exInLayer(layer).length }} · {{ openLayer[layer.id] ? 'скрыть' : 'показать' }}</span>
        </button>
        <div v-show="openLayer[layer.id]" class="ex-grid">
          <ExerciseCard v-for="ex in exInLayer(layer)" :key="ex.id" :ex="ex" />
        </div>
      </div>
    </div>

    <div class="group-gap">
      <div class="section-label">
        <h2>Детали</h2>
        <span class="hint">питание · баланс</span>
      </div>

      <details class="disclose">
        <summary>
          Питание по дням
          <span class="meta-line">белок · ккал</span>
        </summary>
        <div class="disclose-body">
          <div class="grid grid-2">
            <div>
              <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Белок</h3>
              <button
                type="button"
                class="chart-hit"
                aria-label="Открыть график белка"
                @click="openSheet({
                  title: 'Белок по дням',
                  subtitle: 'г',
                  labels: foodLabels,
                  datasets: proteinDatasets,
                  suggestedMax: 220,
                  hint: `среднее ${s.avgProtein} г · цель ${meta.targetProtein.join('–')}`,
                })"
              >
                <div class="chart-box">
                  <LineChart :labels="foodLabels" :datasets="proteinDatasets" :suggested-max="220" />
                </div>
                <span class="chart-hit-hint">нажми — крупнее</span>
              </button>
            </div>
            <div>
              <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Ккал</h3>
              <button
                type="button"
                class="chart-hit"
                aria-label="Открыть график ккал"
                @click="openSheet({
                  title: 'Ккал: еда и активность',
                  subtitle: 'приём · оценка расхода',
                  labels: foodLabels,
                  datasets: kcalDatasets,
                  suggestedMax: kcalChartMax,
                  hint: burnHint,
                })"
              >
                <div class="chart-box">
                  <LineChart :labels="foodLabels" :datasets="kcalDatasets" :suggested-max="kcalChartMax" />
                </div>
                <span class="chart-hit-hint">нажми — крупнее · пунктир = активность</span>
              </button>
              <p class="hint-line">{{ burnHint }}</p>
            </div>
          </div>
        </div>
      </details>

      <details class="disclose">
        <summary>
          Баланс нагрузки
          <span class="meta-line">A / B / C</span>
        </summary>
        <div class="disclose-body">
          <div class="grid grid-2">
            <div class="chart-box sm">
              <DoughnutChart
                :labels="kindOrder.map((k) => kindLabels[k])"
                :values="doughnutValues"
                :colors="kindColors"
              />
            </div>
            <div>
              <div class="chart-box sm">
                <RadarChart
                  :labels="['A', 'B', 'C', 'Лёгкий', 'Белок-дни']"
                  :values="radarValues"
                  label="Объём"
                />
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>

    <ChartSheet
      :open="!!sheet"
      :title="sheet?.title || ''"
      :subtitle="sheet?.subtitle || ''"
      :labels="sheet?.labels || []"
      :datasets="sheet?.datasets || []"
      :suggested-max="sheet?.suggestedMax"
      :suggested-min="sheet?.suggestedMin"
      :hint="sheet?.hint || ''"
      @close="sheet = null"
    />
  </div>
</template>
