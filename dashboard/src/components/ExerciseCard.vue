<script setup>
import { computed, ref } from 'vue'
import { LineChart } from './Charts'
import ProgressBadge from './ProgressBadge.vue'
import ChartSheet from './ChartSheet.vue'
import { byChrono } from '@/data/chrono'
import { deltaFromPoints } from '@/lib/progressDelta'
import { pointMetaFor, resolvePointDose } from '@/lib/exerciseDose'
import { formatTonnageKg } from '@/lib/tonnage'

const props = defineProps({
  ex: { type: Object, required: true },
  tone: { type: String, default: '' },
})

const open = ref(false)

const pct = computed(() => {
  if (!props.ex.goal) return null
  return Math.min(100, Math.round((props.ex.current / props.ex.goal) * 100))
})

const sorted = computed(() => byChrono(props.ex.points || []))
const labels = computed(() => sorted.value.map((p) => p.label))

const datasets = computed(() => {
  const meta = sorted.value.map((p) => pointMetaFor(props.ex.id, p))
  return [{
    label: props.ex.unit,
    data: sorted.value.map((p) => p.v),
    borderColor: props.ex.color,
    backgroundColor: props.ex.color + '22',
    fill: true,
    tension: 0.35,
    pointRadius: 4,
    pointHoverRadius: 7,
    pointBackgroundColor: props.ex.color,
    pointBorderColor: '#fff',
    pointBorderWidth: 1,
    pointMeta: meta,
  }]
})

const chartDatasets = computed(() => {
  const base = datasets.value
  if (!props.ex.targetMax && !props.ex.goal) return base
  const guide = props.ex.targetMax || props.ex.goal
  return [
    ...base,
    {
      label: `ориентир ${guide}`,
      data: sorted.value.map(() => guide),
      borderColor: 'rgba(107, 79, 58, 0.45)',
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
      _skipLabels: true,
    },
  ]
})

const chartMax = computed(() => {
  const vals = sorted.value.map((p) => Number(p.v)).filter((v) => !Number.isNaN(v))
  const dataMax = vals.length ? Math.max(...vals) : 0
  const guide = props.ex.targetMax || props.ex.goal || 0
  if (!guide && !dataMax) return undefined
  return Math.max(dataMax, guide) * 1.08
})

const unitShort = computed(() => {
  const u = props.ex.unit || ''
  if (/кг/i.test(u)) return 'кг'
  if (/повт/i.test(u)) return ''
  if (/с/i.test(u) && !/сесс/i.test(u)) return 'с'
  return ''
})

const delta = computed(() => deltaFromPoints(sorted.value, unitShort.value))

const lastDose = computed(() => {
  const last = sorted.value.at(-1)
  return last ? resolvePointDose(props.ex.id, last) : ''
})

const lastTonnage = computed(() => {
  const meta = lastDose.value ? pointMetaFor(props.ex.id, sorted.value.at(-1)) : null
  return meta?.tonnageKg > 0 ? formatTonnageKg(meta.tonnageKg) : ''
})

const sheetHint = computed(() => {
  const parts = []
  if (lastDose.value) parts.push(lastDose.value)
  if (lastTonnage.value) parts.push(`тонаж ${lastTonnage.value}`)
  if (props.ex.currentLabel) parts.push(props.ex.currentLabel)
  if (pct.value != null) parts.push(`${pct.value}% к цели ${props.ex.goal}`)
  if (delta.value.label && delta.value.abs) parts.push(`к прошлому: ${delta.value.label}`)
  return parts.join(' · ')
})

function fmtVal(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  if (Number.isInteger(n)) return String(n)
  return String(Math.round(n * 10) / 10).replace('.', ',')
}

function openSheet() {
  if (sorted.value.length < 1) return
  open.value = true
}
</script>

<template>
  <div class="ex-card gym-card" :class="tone">
    <div class="head">
      <span class="name">
        {{ ex.name }}
        <ProgressBadge v-if="delta.label && delta.abs" :label="delta.label" :tone="delta.tone" />
      </span>
      <span class="badge" :class="tone === 'anna-tone' ? 'anna' : ''">{{ ex.trend }}</span>
    </div>
    <div class="now">
      <template v-if="lastDose">{{ lastDose }}</template>
      <template v-else>
        {{ ex.current }}
        <small>{{ ex.unit }}</small>
      </template>
    </div>
    <div class="meta">
      <template v-if="lastTonnage">тонаж {{ lastTonnage }} · </template>
      {{ ex.currentLabel || '' }}
      <template v-if="pct != null"> · {{ pct }}% к цели {{ ex.goal }}</template>
    </div>
    <button
      v-if="sorted.length"
      type="button"
      class="chart-hit"
      aria-label="Открыть график крупнее"
      @click="openSheet"
    >
      <div class="chart-box sm">
        <LineChart
          :labels="labels"
          :datasets="chartDatasets"
          :suggested-max="chartMax"
          :value-format="fmtVal"
          :y-tick-format="fmtVal"
          dense
          @chart-click="openSheet"
        />
      </div>
      <span class="chart-hit-hint">наведи — доза и тонаж · нажми — крупнее</span>
    </button>

    <ChartSheet
      :open="open"
      :title="ex.name"
      :subtitle="ex.unit || ''"
      :labels="labels"
      :datasets="chartDatasets"
      :suggested-max="chartMax"
      :value-format="fmtVal"
      :y-tick-format="fmtVal"
      :hint="sheetHint"
      @close="open = false"
    >
      <ul v-if="sorted.length" class="ex-point-list">
        <li
          v-for="(p, i) in [...sorted].reverse()"
          :key="p.label + '-' + i"
          class="ex-point-item"
        >
          <div class="ex-point-date">{{ p.label }}</div>
          <div class="ex-point-dose">
            <template v-if="resolvePointDose(ex.id, p)">
              {{ resolvePointDose(ex.id, p) }}
              <template v-if="pointMetaFor(ex.id, p).tonnageKg">
                · {{ formatTonnageKg(pointMetaFor(ex.id, p).tonnageKg) }}
              </template>
            </template>
            <template v-else>{{ p.v }} {{ ex.unit }}</template>
          </div>
        </li>
      </ul>
    </ChartSheet>
  </div>
</template>
