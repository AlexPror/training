<script setup>
import { computed, ref } from 'vue'
import { LineChart } from '@/components/Charts'
import ChartSheet from '@/components/ChartSheet.vue'
import {
  formatTonnageKg,
  tonnageGuide,
  tonnageSeries,
} from '@/lib/tonnage'

const props = defineProps({
  trainRows: { type: Array, default: () => [] },
  bodyweightKg: { type: Number, default: null },
})

const open = ref(false)
const series = computed(() => tonnageSeries(props.trainRows))
const guide = computed(() => tonnageGuide(props.bodyweightKg))

const labels = computed(() => series.value.map((p) => p.label))
const values = computed(() => series.value.map((p) => p.totalKg))

const datasets = computed(() => {
  const main = {
    label: 'Тонаж',
    data: values.value,
    borderColor: '#c45c28',
    backgroundColor: 'rgba(196, 92, 40, 0.15)',
    fill: true,
    tension: 0.35,
    pointRadius: 4,
    pointBackgroundColor: '#c45c28',
  }
  const g = guide.value
  if (!g || !values.value.length) return [main]
  const n = values.value.length
  return [
    main,
    {
      label: `лёгкая ≈ ${formatTonnageKg(g.softMinKg)}`,
      data: Array(n).fill(g.softMinKg),
      borderColor: 'rgba(14, 23, 20, 0.25)',
      borderDash: [5, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
    },
    {
      label: `плотная ≈ ${formatTonnageKg(g.softMaxKg)}`,
      data: Array(n).fill(g.softMaxKg),
      borderColor: 'rgba(196, 92, 40, 0.45)',
      borderDash: [5, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
    },
  ]
})

const chartMax = computed(() => {
  const dataMax = values.value.length ? Math.max(...values.value) : 0
  const guideMax = guide.value?.softMaxKg || 0
  const m = Math.max(dataMax, guideMax)
  return m > 0 ? m * 1.12 : undefined
})

const last = computed(() => series.value.at(-1) || null)
const peak = computed(() => {
  if (!series.value.length) return null
  return series.value.reduce((a, b) => (b.totalKg > a.totalKg ? b : a))
})
const delta = computed(() => {
  if (series.value.length < 2) return null
  return series.value.at(-1).totalKg - series.value[0].totalKg
})

const sheetHint = computed(() => {
  if (!guide.value) return 'Только вес снаряда × повторы.'
  return `${guide.value.note} Для ${Math.round(guide.value.bodyweightKg)} кг: лёгкая ≈ ${formatTonnageKg(guide.value.softMinKg)}, плотная ≈ ${formatTonnageKg(guide.value.softMaxKg)}.`
})
</script>

<template>
  <div class="tonnage-trend panel gym-panel">
    <div class="tonnage-trend-head">
      <div>
        <p class="eyebrow" style="margin:0">Volume load</p>
        <p class="tonnage-trend-now">
          <template v-if="last">{{ formatTonnageKg(last.totalKg) }}</template>
          <template v-else>—</template>
          <small v-if="last"> · {{ last.label }}</small>
        </p>
      </div>
      <div class="tonnage-trend-stats">
        <span v-if="peak">пик {{ formatTonnageKg(peak.totalKg) }}</span>
        <span
          v-if="delta != null"
          :data-up="delta > 0 ? '1' : delta < 0 ? '0' : null"
        >
          {{ delta > 0 ? '+' : '' }}{{ formatTonnageKg(Math.abs(delta)) }}
          <template v-if="delta !== 0"> за период</template>
        </span>
      </div>
    </div>

    <button
      v-if="series.length >= 2"
      type="button"
      class="chart-hit"
      aria-label="Открыть тонаж крупнее"
      @click="open = true"
    >
      <div class="chart-box sm" style="margin-top:0.75rem">
        <LineChart
          :labels="labels"
          :datasets="datasets"
          :suggested-max="chartMax"
        />
      </div>
      <span class="chart-hit-hint">нажми — крупнее</span>
    </button>
    <p v-else-if="series.length === 1" class="hint-line">Ещё одна сессия со снарядом — появится линия.</p>
    <p v-else class="hint-line">Нет сессий с весом снаряда в логе.</p>

    <p v-if="guide" class="hint-line" style="margin:0.5rem 0 0">
      {{ guide.note }} Для {{ Math.round(guide.bodyweightKg) }} кг:
      лёгкая ≈ {{ formatTonnageKg(guide.softMinKg) }},
      плотная ≈ {{ formatTonnageKg(guide.softMaxKg) }}.
    </p>

    <ChartSheet
      :open="open"
      title="Тонаж по сессиям"
      subtitle="только снаряд · кг×повт"
      :labels="labels"
      :datasets="datasets"
      :suggested-max="chartMax"
      :hint="sheetHint"
      @close="open = false"
    >
      <ul v-if="series.length" class="tonnage-sheet-list">
        <li v-for="p in [...series].reverse()" :key="p.date + p.type">
          <span>{{ p.label }}</span>
          <span class="hint">{{ p.type }}</span>
          <strong>{{ formatTonnageKg(p.totalKg) }}</strong>
        </li>
      </ul>
    </ChartSheet>
  </div>
</template>
