<script setup>
import { computed, ref } from 'vue'
import FoodDayPanel from '@/components/FoodDayPanel.vue'
import ChartSheet from '@/components/ChartSheet.vue'
import PeriodPicker from '@/components/PeriodPicker.vue'
import { LineChart } from '@/components/Charts'
import { meta, foodRows, trainRows, summary } from '@/data/alexander'
import { byChrono } from '@/data/chrono'
import { inPeriod } from '@/lib/period'
import {
  burnSeriesForLabels,
  burnGuideNote,
} from '@/lib/activityBurn'

const s = summary()
const period = ref(null)
const sheet = ref(null)

const fullFood = computed(() => {
  let rows = byChrono(
    foodRows.filter((r) => r.kcalMid >= 1400),
    (r) => r.date,
  )
  if (period.value) rows = rows.filter((r) => inPeriod(r.date, period.value))
  return rows
})

const trainInPeriod = computed(() => {
  if (!period.value) return trainRows
  return trainRows.filter((t) => inPeriod(t.date, period.value))
})

const foodLabels = computed(() => fullFood.value.map((r) => r.date))
const proteinDatasets = computed(() => [{
  label: 'Белок г',
  data: fullFood.value.map((r) => r.proteinMid),
  borderColor: '#0a7a5c',
  backgroundColor: '#0a7a5c22',
  fill: true,
  tension: 0.3,
  pointRadius: 3,
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
      pointRadius: 3,
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
      _skipLabels: true,
    },
  ]
})

const kcalChartMax = computed(() => {
  const intake = fullFood.value.map((r) => r.kcalMid)
  const burn = burnValues.value.filter((v) => v != null)
  const m = Math.max(...intake, ...(burn.length ? burn : [0]), 2200)
  return Math.ceil(m / 100) * 100 + 100
})
</script>

<template>
  <div class="athlete-page">
    <h1 class="page-title">Еда</h1>
    <p class="page-sub">
      Как у детей: меню + таблица БЖУ. Цель белок {{ meta.targetProtein.join('–') }} · ккал {{ meta.targetKcal.join('–') }}.
    </p>

    <PeriodPicker
      slug="alexander-food"
      :dates="foodRows.map((r) => r.date)"
      track-from="2026-08-17"
      @update:period="period = $event"
    />

    <div class="section-label group-gap">
      <h2>День</h2>
      <span class="hint">таблица и итог</span>
    </div>
    <FoodDayPanel />

    <div class="section-label group-gap">
      <h2>По дням</h2>
      <span class="hint">графики</span>
    </div>
    <div class="grid grid-2">
      <button
        type="button"
        class="chart-hit panel"
        style="padding:0.85rem"
        @click="sheet = { title: 'Белок по дням', subtitle: 'г', labels: foodLabels, datasets: proteinDatasets, suggestedMax: 220, hint: `среднее ${s.avgProtein} г` }"
      >
        <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Белок</h3>
        <div class="chart-box sm">
          <LineChart :labels="foodLabels" :datasets="proteinDatasets" :suggested-max="220" />
        </div>
        <span class="chart-hit-hint">нажми — крупнее</span>
      </button>
      <button
        type="button"
        class="chart-hit panel"
        style="padding:0.85rem"
        @click="sheet = { title: 'Ккал: еда и активность', subtitle: 'приём · расход', labels: foodLabels, datasets: kcalDatasets, suggestedMax: kcalChartMax, hint: burnHint }"
      >
        <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Ккал</h3>
        <div class="chart-box sm">
          <LineChart :labels="foodLabels" :datasets="kcalDatasets" :suggested-max="kcalChartMax" />
        </div>
        <span class="chart-hit-hint">нажми — крупнее</span>
      </button>
    </div>
    <p class="hint-line">{{ burnHint }}</p>

    <ChartSheet
      :open="!!sheet"
      :title="sheet?.title || ''"
      :subtitle="sheet?.subtitle || ''"
      :labels="sheet?.labels || []"
      :datasets="sheet?.datasets || []"
      :suggested-max="sheet?.suggestedMax"
      :hint="sheet?.hint || ''"
      @close="sheet = null"
    />
  </div>
</template>
