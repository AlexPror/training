import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Chart,
  LineController,
  BarController,
  DoughnutController,
  RadarController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Legend,
  Tooltip,
} from 'chart.js'
import { formatTonnageKg, tonnageFromDose } from '@/lib/tonnage'

Chart.register(
  LineController,
  BarController,
  DoughnutController,
  RadarController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Legend,
  Tooltip,
)

const FONT = 'DM Sans, system-ui, sans-serif'

/** Подписи значений над точками (как у детей) */
const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart, _args, opts) {
    if (!opts?.enabled) return
    const { ctx } = chart
    const format = opts.format || ((v) => String(v))
    chart.data.datasets.forEach((ds, di) => {
      if (ds._skipLabels || ds.borderDash?.length) return
      const meta = chart.getDatasetMeta(di)
      if (meta.hidden) return
      meta.data.forEach((pt, i) => {
        const raw = ds.data[i]
        if (raw == null || Number.isNaN(Number(raw))) return
        const label = format(raw, i, ds)
        if (!label) return
        ctx.save()
        ctx.fillStyle = opts.color || '#2a322e'
        ctx.font = opts.font || `600 10px ${FONT}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(label, pt.x, pt.y - 6)
        ctx.restore()
      })
    })
  },
}
Chart.register(valueLabelsPlugin)

function useChart(type, dataRef, optionsRef, onClickRef) {
  const canvas = ref(null)
  let chart

  function apply() {
    if (!chart) return
    const raw = dataRef.value || { labels: [], datasets: [] }
    // Клон: Chart.js мутирует data in-place — deep-watch иначе уходит в цикл и «роняет» страницу
    chart.data = {
      labels: [...(raw.labels || [])],
      datasets: (raw.datasets || []).map((ds) => ({
        ...ds,
        data: Array.isArray(ds.data) ? [...ds.data] : ds.data,
        pointMeta: Array.isArray(ds.pointMeta) ? ds.pointMeta.map((m) => ({ ...m })) : ds.pointMeta,
        pointRadius: Array.isArray(ds.pointRadius) ? [...ds.pointRadius] : ds.pointRadius,
        pointBackgroundColor: Array.isArray(ds.pointBackgroundColor)
          ? [...ds.pointBackgroundColor]
          : ds.pointBackgroundColor,
        borderDash: Array.isArray(ds.borderDash) ? [...ds.borderDash] : ds.borderDash,
      })),
    }
    chart.options = {
      ...optionsRef.value,
      onClick: (evt, elements) => {
        onClickRef?.value?.(evt, elements, chart)
      },
    }
    chart.update('none')
  }

  onMounted(() => {
    const raw = dataRef.value || { labels: [], datasets: [] }
    chart = new Chart(canvas.value, {
      type,
      data: {
        labels: [...(raw.labels || [])],
        datasets: (raw.datasets || []).map((ds) => ({
          ...ds,
          data: Array.isArray(ds.data) ? [...ds.data] : ds.data,
        })),
      },
      options: {
        ...optionsRef.value,
        onClick: (evt, elements) => {
          onClickRef?.value?.(evt, elements, chart)
        },
      },
    })
  })
  watch(
    () =>
      JSON.stringify({
        labels: dataRef.value?.labels || [],
        series: (dataRef.value?.datasets || []).map((d) => ({
          data: d.data,
          label: d.label,
          pointMeta: d.pointMeta,
          borderDash: d.borderDash,
          _skip: d._skipLabels,
        })),
        max: optionsRef.value?.scales?.y?.suggestedMax ?? null,
        min: optionsRef.value?.scales?.y?.suggestedMin ?? null,
        values: optionsRef.value?.plugins?.valueLabels?.enabled !== false,
      }),
    () => apply(),
  )
  onBeforeUnmount(() => chart?.destroy())
  return canvas
}

function formatTick(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  if (Math.abs(n) >= 10000) {
    const k = n / 1000
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`
  }
  if (Number.isInteger(n)) return String(n)
  return String(Math.round(n * 10) / 10)
}

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'nearest', intersect: true },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(14, 23, 20, 0.92)',
      titleFont: { family: 'DM Sans', size: 12, weight: '600' },
      bodyFont: { family: 'DM Sans', size: 12 },
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label(ctx) {
          const ds = ctx.dataset || {}
          if (ds._skipLabels || (ds.borderDash && ds.borderDash.length)) {
            return String(ds.label || 'ориентир').trim() || null
          }
          const label = ds.label ? `${ds.label}: ` : ''
          const v = ctx.parsed.y
          if (v == null) return label
          return `${label}${formatTick(v)}`
        },
      },
    },
  },
  scales: {
    x: {
      reverse: false,
      ticks: {
        font: { family: 'DM Sans', size: 10 },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
      grid: { color: 'rgba(0,0,0,0.04)' },
    },
    y: {
      ticks: {
        font: { family: 'DM Sans', size: 10 },
        callback: (v) => formatTick(v),
      },
      grid: { color: 'rgba(0,0,0,0.06)' },
    },
  },
}

function tooltipLinesForPoint(ctx, valFmt) {
  if (ctx.dataset._skipLabels || ctx.dataset.borderDash?.length) {
    return String(ctx.dataset.label || 'ориентир').trim() || null
  }
  const meta = ctx.dataset.pointMeta?.[ctx.dataIndex] || {}
  const dose = meta.dose ? String(meta.dose).trim() : ''
  const tonnageKg =
    meta.tonnageKg != null
      ? Number(meta.tonnageKg)
      : dose
        ? tonnageFromDose(dose)
        : null
  const v = ctx.parsed.y
  const unit = ctx.dataset.label || ''
  const lines = []
  if (dose) lines.push(dose)
  else if (v != null) lines.push(`${valFmt(v)}${unit ? ` ${unit}` : ''}`)
  if (tonnageKg != null && tonnageKg > 0) {
    lines.push(`тонаж ${formatTonnageKg(tonnageKg)}`)
  }
  if (dose && v != null) lines.push(`пик ${valFmt(v)}`)
  return lines.length ? lines : unit || ''
}

export const LineChart = defineComponent({
  name: 'LineChart',
  props: {
    labels: Array,
    datasets: Array,
    suggestedMax: Number,
    suggestedMin: Number,
    showLegend: Boolean,
    showValues: { type: Boolean, default: true },
    valueFormat: Function,
    yTickFormat: Function,
    dense: Boolean,
  },
  emits: ['chart-click'],
  setup(props, { emit }) {
    const data = computed(() => ({ labels: props.labels, datasets: props.datasets }))
    const onClick = ref((evt, elements) => {
      emit('chart-click', { evt, elements })
    })
    const options = computed(() => {
      const tickFmt = props.yTickFormat || formatTick
      const valFmt = props.valueFormat || ((v) => formatTick(v))
      return {
        ...baseOpts,
        plugins: {
          ...baseOpts.plugins,
          legend: props.showLegend
            ? {
                display: true,
                position: 'bottom',
                labels: { boxWidth: 10, font: { family: 'DM Sans', size: 11 } },
              }
            : { display: false },
          valueLabels: {
            enabled: props.showValues !== false,
            format: valFmt,
            font: props.dense
              ? `600 9px ${FONT}`
              : `600 10px ${FONT}`,
          },
          tooltip: {
            ...baseOpts.plugins.tooltip,
            filter(item) {
              const ds = item.dataset || {}
              if (ds._skipLabels || (ds.borderDash && ds.borderDash.length)) return false
              return true
            },
            callbacks: {
              ...baseOpts.plugins.tooltip.callbacks,
              label(ctx) {
                return tooltipLinesForPoint(ctx, valFmt)
              },
            },
          },
        },
        scales: {
          ...baseOpts.scales,
          x: {
            ...baseOpts.scales.x,
            ticks: {
              ...baseOpts.scales.x.ticks,
              maxTicksLimit: props.dense ? 6 : 10,
            },
          },
          y: {
            ...baseOpts.scales.y,
            suggestedMax: props.suggestedMax,
            suggestedMin: props.suggestedMin,
            beginAtZero: props.suggestedMin == null,
            ticks: {
              ...baseOpts.scales.y.ticks,
              callback: (v) => tickFmt(v),
            },
          },
        },
      }
    })
    const canvas = useChart('line', data, options, onClick)
    return () =>
      h('canvas', {
        ref: canvas,
        role: 'img',
        style: { cursor: 'pointer' },
      })
  },
})

export const BarChart = defineComponent({
  name: 'BarChart',
  props: {
    labels: Array,
    datasets: Array,
  },
  setup(props) {
    const data = computed(() => ({ labels: props.labels, datasets: props.datasets }))
    const options = computed(() => ({
      ...baseOpts,
      scales: {
        ...baseOpts.scales,
        y: { ...baseOpts.scales.y, beginAtZero: true },
      },
    }))
    const canvas = useChart('bar', data, options, ref(null))
    return () => h('canvas', { ref: canvas })
  },
})

export const DoughnutChart = defineComponent({
  name: 'DoughnutChart',
  props: {
    labels: Array,
    values: Array,
    colors: Array,
  },
  setup(props) {
    const data = computed(() => ({
      labels: props.labels,
      datasets: [{
        data: props.values,
        backgroundColor: props.colors,
        borderWidth: 0,
      }],
    }))
    const options = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { family: 'DM Sans', size: 11 } } },
        tooltip: { ...baseOpts.plugins.tooltip },
      },
    }))
    const canvas = useChart('doughnut', data, options, ref(null))
    return () => h('canvas', { ref: canvas })
  },
})

export const RadarChart = defineComponent({
  name: 'RadarChart',
  props: {
    labels: Array,
    values: Array,
    label: { type: String, default: 'Неделя' },
    color: { type: String, default: '#245c48' },
  },
  setup(props) {
    const data = computed(() => ({
      labels: props.labels,
      datasets: [{
        label: props.label,
        data: props.values,
        backgroundColor: props.color + '33',
        borderColor: props.color,
        pointBackgroundColor: props.color,
        borderWidth: 2,
      }],
    }))
    const options = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          beginAtZero: true,
          max: 5,
          ticks: { stepSize: 1, display: false },
          pointLabels: { font: { family: 'DM Sans', size: 11 } },
          grid: { color: 'rgba(0,0,0,0.08)' },
        },
      },
    }))
    const canvas = useChart('radar', data, options, ref(null))
    return () => h('canvas', { ref: canvas })
  },
})

export { formatTick as formatChartTick }
