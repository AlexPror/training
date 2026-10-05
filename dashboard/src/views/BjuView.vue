<script setup>
import { computed, ref } from 'vue'
import { FOODS, QUICK, macros } from '@/data/foods'
import { foodRows, meta } from '@/data/alexander'
import { byChrono } from '@/data/chrono'
import { LineChart } from '@/components/Charts'
import ChartSheet from '@/components/ChartSheet.vue'
import PeriodPicker from '@/components/PeriodPicker.vue'
import { inPeriod } from '@/lib/period'

const meal = ref([])
const selected = ref(FOODS[0].id)
const grams = ref(100)
const search = ref('')
const period = ref(null)
const sheet = ref(null)
const selectedDay = ref(null)

const food = computed(() => FOODS.find((f) => f.id === selected.value))
const cats = computed(() => [...new Set(FOODS.map((f) => f.cat))])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return FOODS
  return FOODS.filter((f) => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q))
})

const sums = computed(() => {
  let kcal = 0, p = 0, f = 0, c = 0
  for (const row of meal.value) {
    const fd = FOODS.find((x) => x.id === row.id)
    const m = macros(fd, row.grams)
    kcal += m.kcal; p += m.p; f += m.f; c += m.c
  }
  return {
    kcal: Math.round(kcal),
    p: Math.round(p * 10) / 10,
    f: Math.round(f * 10) / 10,
    c: Math.round(c * 10) / 10,
  }
})

const pPct = computed(() => Math.min(100, (sums.value.p / 180) * 100))
const kPct = computed(() => Math.min(100, (sums.value.kcal / 2200) * 100))
const kWarn = computed(() => sums.value.kcal > 2200)

const status = computed(() => {
  if (!meal.value.length) return { cls: '', text: 'Добавь продукты — сравним с целью дня.' }
  if (sums.value.p < 140) return { cls: 'low', text: `Белка мало. Ещё ~${Math.round(160 - sums.value.p)} г до низа цели.` }
  if (sums.value.p < 160) return { cls: 'low', text: `Белок у нижней границы. Добор ~${Math.round(170 - sums.value.p)} г.` }
  if (sums.value.kcal > 2200) return { cls: 'high', text: `Белок ок. Ккал выше потолка (+${sums.value.kcal - 2200}).` }
  return { cls: 'ok', text: `В коридоре: белок ${sums.value.p} г, ккал ~${sums.value.kcal}.` }
})

const diaryDays = computed(() => {
  let rows = byChrono(foodRows, (r) => r.date)
  if (period.value) rows = rows.filter((r) => inPeriod(r.date, period.value))
  return [...rows].reverse()
})

const diaryAvg = computed(() => {
  const rows = diaryDays.value.filter((r) => r.kcalMid >= 1400)
  if (!rows.length) return { kcal: 0, protein: 0, n: 0 }
  return {
    n: rows.length,
    kcal: Math.round(rows.reduce((a, r) => a + r.kcalMid, 0) / rows.length),
    protein: Math.round(rows.reduce((a, r) => a + r.proteinMid, 0) / rows.length),
  }
})

const diaryLabels = computed(() => [...diaryDays.value].reverse().map((r) => r.date))
const diaryKcalData = computed(() => [...diaryDays.value].reverse().map((r) => r.kcalMid))
const diaryProteinData = computed(() => [...diaryDays.value].reverse().map((r) => r.proteinMid))

const diaryKcalSets = computed(() => [
  {
    label: 'Еда',
    data: diaryKcalData.value,
    borderColor: '#c45c28',
    backgroundColor: '#c45c2822',
    fill: true,
    tension: 0.3,
    pointRadius: 2,
  },
  {
    label: 'Потолок 2200',
    data: diaryLabels.value.map(() => 2200),
    borderColor: 'rgba(196,92,40,0.35)',
    borderDash: [4, 4],
    pointRadius: 0,
    fill: false,
    tension: 0,
  },
])

const diaryProteinSets = computed(() => [
  {
    label: 'Белок',
    data: diaryProteinData.value,
    borderColor: '#0a7a5c',
    backgroundColor: '#0a7a5c22',
    fill: true,
    tension: 0.3,
    pointRadius: 2,
  },
  {
    label: 'Цель 170',
    data: diaryLabels.value.map(() => 170),
    borderColor: 'rgba(10,122,92,0.35)',
    borderDash: [4, 4],
    pointRadius: 0,
    fill: false,
    tension: 0,
  },
])

function dayTone(r) {
  if (r.proteinMid < 140) return 'low'
  if (r.kcalMid > 2400) return 'high'
  if (r.proteinMid >= 160 && r.kcalMid >= 1900 && r.kcalMid <= 2200) return 'ok'
  return ''
}

function add(id, g) {
  const fd = FOODS.find((x) => x.id === id)
  if (!fd || !g) return
  meal.value.push({ id, grams: Number(g), uid: Date.now() + Math.random() })
}

function remove(uid) {
  meal.value = meal.value.filter((m) => m.uid !== uid)
}

function onSelectChange() {
  if (food.value?.unitGrams) grams.value = food.value.id === 'egg' ? 2 : 1
  else grams.value = 100
}

function round1(n) {
  return Math.round(n * 10) / 10
}
</script>

<template>
  <div>
    <h1 class="page-title">БЖУ</h1>
    <p class="page-sub">
      Дневник и калькулятор. Цель: белок {{ meta.targetProtein.join('–') }} · ккал {{ meta.targetKcal.join('–') }}.
    </p>

    <PeriodPicker
      slug="food"
      :dates="foodRows.map((r) => r.date)"
      track-from="2026-08-17"
      @update:period="period = $event"
    />

    <div class="section-label group-gap">
      <h2>Дневник</h2>
      <span class="hint" v-if="diaryAvg.n">
        среднее {{ diaryAvg.kcal }} ккал · {{ diaryAvg.protein }} б · {{ diaryAvg.n }} дн.
      </span>
    </div>

    <div class="grid grid-2" style="margin-bottom:1rem">
      <button
        type="button"
        class="chart-hit panel"
        style="padding:0.85rem"
        @click="sheet = { title: 'Ккал по дням', subtitle: 'еда', labels: diaryLabels, datasets: diaryKcalSets, suggestedMax: 3400 }"
      >
        <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Ккал</h3>
        <div class="chart-box sm">
          <LineChart :labels="diaryLabels" :datasets="diaryKcalSets" :suggested-max="3400" />
        </div>
        <span class="chart-hit-hint">нажми — крупнее</span>
      </button>
      <button
        type="button"
        class="chart-hit panel"
        style="padding:0.85rem"
        @click="sheet = { title: 'Белок по дням', subtitle: 'г', labels: diaryLabels, datasets: diaryProteinSets, suggestedMax: 230 }"
      >
        <h3 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--muted)">Белок</h3>
        <div class="chart-box sm">
          <LineChart :labels="diaryLabels" :datasets="diaryProteinSets" :suggested-max="230" />
        </div>
        <span class="chart-hit-hint">нажми — крупнее</span>
      </button>
    </div>

    <div class="food-day-tabs">
      <button
        v-for="d in diaryDays"
        :key="d.date"
        type="button"
        class="food-day-tab"
        :data-tone="dayTone(d)"
        :data-active="selectedDay === d.date ? '1' : null"
        @click="selectedDay = selectedDay === d.date ? null : d.date"
      >
        <span class="food-day-d">{{ d.date }}</span>
        <span class="food-day-k">{{ Math.round(d.kcalMid) }}</span>
        <span class="food-day-p">{{ Math.round(d.proteinMid) }}б</span>
      </button>
    </div>
    <p v-if="selectedDay" class="note">
      {{ selectedDay }}:
      {{ foodRows.find((r) => r.date === selectedDay)?.kcal }} ккал ·
      {{ foodRows.find((r) => r.date === selectedDay)?.protein }} белка
      · ориентир {{ meta.targetKcal.join('–') }} / {{ meta.targetProtein.join('–') }}
    </p>
    <p v-if="!diaryDays.length" class="hint-line">Нет дней еды в этом периоде.</p>

    <div class="status-strip group-gap">
      <div class="status-item">
        <div class="lbl">Ккал цель</div>
        <div class="val" style="font-size:1.35rem">{{ meta.targetKcal.join('–') }}</div>
      </div>
      <div class="status-item">
        <div class="lbl">Белок</div>
        <div class="val" style="font-size:1.35rem">{{ meta.targetProtein.join('–') }}</div>
      </div>
      <div class="status-item">
        <div class="lbl">Сейчас ккал</div>
        <div class="val">{{ sums.kcal }}</div>
      </div>
      <div class="status-item">
        <div class="lbl">Сейчас белок</div>
        <div class="val">{{ sums.p }}</div>
      </div>
    </div>

    <div class="section-label">
      <h2>Калькулятор</h2>
      <span class="hint">собрать день</span>
    </div>

    <div class="grid grid-2">
      <div class="panel">
        <h2>Добавить продукт</h2>
        <div class="controls">
          <div style="flex:2;min-width:160px">
            <label>Продукт</label>
            <select v-model="selected" style="width:100%" @change="onSelectChange">
              <optgroup v-for="cat in cats" :key="cat" :label="cat">
                <option v-for="f in FOODS.filter(x => x.cat === cat)" :key="f.id" :value="f.id">{{ f.name }}</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label>{{ food?.unitLabel || 'Граммы' }}</label>
            <input v-model.number="grams" type="number" min="1" style="width:90px" @keydown.enter="add(selected, grams)" />
          </div>
          <button class="btn" type="button" @click="add(selected, grams)">Добавить</button>
          <button class="btn ghost" type="button" @click="meal = []">Очистить</button>
        </div>
        <p class="note" v-if="food && !food.unitGrams">
          На 100 г: {{ food.kcal }} ккал · Б {{ food.p }} · Ж {{ food.f }} · У {{ food.c }}
        </p>

        <table class="data" v-if="meal.length">
          <thead>
            <tr><th>Продукт</th><th>Кол-во</th><th>ккал</th><th>Б</th><th>Ж</th><th>У</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="row in meal" :key="row.uid">
              <td>{{ FOODS.find(f => f.id === row.id)?.name }}</td>
              <td>{{ row.grams }} {{ FOODS.find(f => f.id === row.id)?.unitLabel || 'г' }}</td>
              <td>{{ Math.round(macros(FOODS.find(f => f.id === row.id), row.grams).kcal) }}</td>
              <td>{{ round1(macros(FOODS.find(f => f.id === row.id), row.grams).p) }}</td>
              <td>{{ round1(macros(FOODS.find(f => f.id === row.id), row.grams).f) }}</td>
              <td>{{ round1(macros(FOODS.find(f => f.id === row.id), row.grams).c) }}</td>
              <td><button class="btn ghost" style="padding:0.15rem 0.4rem" @click="remove(row.uid)">×</button></td>
            </tr>
          </tbody>
        </table>
        <p v-else class="note">Пока пусто.</p>

        <div class="totals">
          <div class="tot"><div class="lbl">Ккал</div><div class="val">{{ sums.kcal }}</div></div>
          <div class="tot"><div class="lbl">Белок</div><div class="val">{{ sums.p }}</div></div>
          <div class="tot"><div class="lbl">Жир</div><div class="val">{{ sums.f }}</div></div>
          <div class="tot"><div class="lbl">Углеводы</div><div class="val">{{ sums.c }}</div></div>
        </div>

        <div style="margin-top:0.85rem">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem">
            <span>Белок → 170</span><span>{{ sums.p }}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" :style="{ width: pPct + '%' }" /></div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-top:0.5rem">
            <span>Ккал → 2200</span><span>{{ sums.kcal }}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" :class="{ warn: kWarn }" :style="{ width: kPct + '%' }" /></div>
          <p class="note" :style="status.cls === 'ok' ? 'color:var(--ok);font-weight:700' : status.cls ? 'color:var(--warn);font-weight:700' : ''">
            {{ status.text }}
          </p>
        </div>
      </div>

      <div class="panel">
        <h2>Быстрый добор</h2>
        <div>
          <button
            v-for="(q, i) in QUICK"
            :key="i"
            class="chip-btn"
            type="button"
            @click="add(q.id, q.g)"
          >{{ q.label }}</button>
        </div>
        <h3 style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--muted)">Справочник</h3>
        <input v-model="search" type="search" placeholder="Поиск…" style="width:100%;margin-bottom:0.5rem;padding:0.45rem;border:1px solid var(--line);border-radius:8px" />
        <div style="max-height:420px;overflow:auto">
          <table class="data">
            <thead><tr><th>Продукт</th><th>ккал</th><th>Б</th><th></th></tr></thead>
            <tbody>
              <tr v-for="f in filtered" :key="f.id">
                <td>{{ f.name }}</td>
                <td>{{ f.kcal }}</td>
                <td>{{ f.p }}</td>
                <td>
                  <button class="chip-btn" type="button" @click="add(f.id, f.unitGrams ? 1 : 100)">
                    +{{ f.unitGrams ? '1' : '100' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ChartSheet
      :open="!!sheet"
      :title="sheet?.title || ''"
      :subtitle="sheet?.subtitle || ''"
      :labels="sheet?.labels || []"
      :datasets="sheet?.datasets || []"
      :suggested-max="sheet?.suggestedMax"
      @close="sheet = null"
    />
  </div>
</template>
