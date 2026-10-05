<script setup>
import { computed, ref, watch } from 'vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
import ChartSheet from '@/components/ChartSheet.vue'
import { BarChart, DoughnutChart } from '@/components/Charts'
import { meta, health, trainRows, exercises, liftSnapshot, runRows } from '@/data/anna'
import { byChrono } from '@/data/chrono'

const last = trainRows[trainRows.length - 1]

const liftLabels = computed(() => liftSnapshot.map((l) => l.name))
const liftDatasets = computed(() => [{
  label: 'кг',
  data: liftSnapshot.map((l) => l.kg),
  backgroundColor: '#1a6f8a',
  borderRadius: 6,
}])

const sheet = ref(null)
const runChrono = byChrono(runRows, (r) => r.date)

const kindOrder = ['mtd', 'A', 'B', 'easy']
const kindLabels = { mtd: 'МТД', A: 'Верх', B: 'Ноги', easy: 'Лёгкий' }
const kindMap = trainRows.reduce((a, t) => {
  a[t.kind] = (a[t.kind] || 0) + 1
  return a
}, {})
const kinds = Object.keys(kindMap)

const sessionFilter = ref('all')
const filterChips = computed(() => {
  const chips = [{ id: 'all', label: 'Все', count: trainRows.length }]
  for (const k of kindOrder) {
    if (kindMap[k]) chips.push({ id: k, label: kindLabels[k] || k, count: kindMap[k] })
  }
  for (const k of kinds) {
    if (!kindOrder.includes(k)) chips.push({ id: k, label: kindLabels[k] || k, count: kindMap[k] })
  }
  return chips
})

function sessionKey(t) {
  return `${t.date}::${t.type}`
}

const sessions = computed(() => {
  const all = [...trainRows].reverse()
  const filtered = sessionFilter.value === 'all'
    ? all
    : all.filter((t) => t.kind === sessionFilter.value)
  return filtered.map((t) => ({ ...t, key: sessionKey(t) }))
})

const openSession = ref(sessions.value[0]?.key || null)
watch(sessionFilter, () => {
  openSession.value = sessions.value[0]?.key || null
})
function toggleSession(key) {
  openSession.value = openSession.value === key ? null : key
}
</script>

<template>
  <div>
    <h1 class="page-title">{{ meta.name }}</h1>
    <p class="page-sub">{{ meta.note }} · обновлено {{ meta.updated }}</p>

    <div class="status-strip" style="background:linear-gradient(135deg,rgba(26,111,138,0.14),rgba(10,122,92,0.08));border-color:rgba(26,111,138,0.2)">
      <div class="status-item">
        <div class="lbl">Последняя</div>
        <div class="val" style="font-size:1.15rem">{{ last?.date }}</div>
        <div class="hint">{{ last?.type }} · {{ last?.mark }}</div>
      </div>
      <div class="status-item">
        <div class="lbl">Goblet / мост</div>
        <div class="val">{{ exercises[0]?.current }}</div>
        <div class="hint">кг</div>
      </div>
      <div class="status-item">
        <div class="lbl">Сессии</div>
        <div class="val">{{ trainRows.length }}</div>
        <div class="hint">в журнале</div>
      </div>
      <div class="status-item">
        <div class="lbl">Бег / ход</div>
        <div class="val" style="font-size:1.15rem">{{ runRows.length }}</div>
        <div class="hint">записей</div>
      </div>
    </div>

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
              <span class="session-type" style="color:var(--anna)">{{ t.type }}</span>
            </div>
            <div class="session-card-end">
              <span class="session-mark" style="color:var(--anna)">{{ t.mark }}</span>
              <span class="session-chevron" aria-hidden="true">{{ openSession === t.key ? '▾' : '▸' }}</span>
            </div>
          </div>
          <p v-if="openSession !== t.key" class="session-preview">{{ t.body }}</p>
        </button>
        <div v-show="openSession === t.key" class="session-panel">
          <p class="session-body">{{ t.body }}</p>
        </div>
      </article>
      <p v-if="!sessions.length" class="hint-line">Нет сессий в этом фильтре.</p>
    </div>

    <div class="group-gap">
      <div class="section-label">
        <h2>Детали</h2>
        <span class="hint">раскрыть по необходимости</span>
      </div>

      <details class="disclose" open>
        <summary>
          Здоровье / маркеры
          <span class="meta-line">SUI · ТБС · нагрузка</span>
        </summary>
        <div class="disclose-body">
          <table class="data">
            <thead>
              <tr><th>Тема</th><th>Старт</th><th>Сейчас</th><th>Цель</th></tr>
            </thead>
            <tbody>
              <tr v-for="h in health" :key="h.name">
                <td>{{ h.name }}</td>
                <td>{{ h.start }}</td>
                <td>{{ h.now }}</td>
                <td>{{ h.goal }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      <details class="disclose">
        <summary>
          Веса и типы сессий
          <span class="meta-line">снимок</span>
        </summary>
        <div class="disclose-body">
          <div class="grid grid-2">
            <div>
              <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Рабочие веса</h3>
              <button
                type="button"
                class="chart-hit"
                aria-label="Открыть веса крупнее"
                @click="sheet = {
                  title: 'Рабочие веса',
                  subtitle: 'кг',
                  labels: liftLabels,
                  datasets: liftDatasets,
                  hint: 'Goblet/мост 5→8 кг. RDL легче для контроля SUI.',
                  mode: 'bar',
                }"
              >
                <div class="chart-box">
                  <BarChart :labels="liftLabels" :datasets="liftDatasets" />
                </div>
                <span class="chart-hit-hint">нажми — крупнее</span>
              </button>
              <p class="note">Goblet/мост 5→8 кг. RDL легче для контроля SUI.</p>
            </div>
            <div>
              <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Типы сессий</h3>
              <div class="chart-box sm">
                <DoughnutChart
                  :labels="kinds.map((k) => kindLabels[k] || k)"
                  :values="kinds.map((k) => kindMap[k])"
                  :colors="['#1a6f8a', '#0a7a5c', '#3a8a9a', '#6a8a7a']"
                />
              </div>
              <p class="note">Бег/ход: {{ runChrono.map(r => r.km).join(' · ') }} км</p>
            </div>
          </div>
        </div>
      </details>

      <details class="disclose">
        <summary>
          Упражнения
          <span class="meta-line">{{ exercises.length }} графиков</span>
        </summary>
        <div class="disclose-body">
          <div class="ex-grid">
            <ExerciseCard v-for="ex in exercises" :key="ex.id" :ex="ex" tone="anna-tone" />
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
      :hint="sheet?.hint || ''"
      :chart-type="sheet?.mode === 'bar' ? 'bar' : 'line'"
      @close="sheet = null"
    />
  </div>
</template>
