<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import RingProgress from '@/components/RingProgress.vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
import TonnageTrend from '@/components/TonnageTrend.vue'
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
import { formatTonnageKg, tonnageSeries } from '@/lib/tonnage'
import { inPeriod } from '@/lib/period'

const s = summary()
const period = ref(null)

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
const openLayer = ref({ pull: true, push: true, legs: true, core: false })

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
        <p class="eyebrow">Athlete · кабинет</p>
        <h1 class="page-title">{{ meta.name }}</h1>
        <p class="page-sub">Сила · тонаж · обновлено {{ meta.updated }}</p>
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

    <div class="quick-tabs">
      <RouterLink class="quick-tab" to="/alexander/diary">Дневник сессий →</RouterLink>
      <RouterLink class="quick-tab" to="/alexander/food">Еда / БЖУ →</RouterLink>
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
        <h2>Упражнения</h2>
        <span class="hint">наведи на точку — доза и тонаж</span>
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

    <details class="disclose group-gap">
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
