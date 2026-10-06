<script setup>
import { computed, ref, watch } from 'vue'
import { foodDays, meta } from '@/data/alexander'
import { amountLabel, dayMacros, fromIsoDate } from '@/lib/dayFood'

const props = defineProps({
  /** Если задан — подсветить этот день (DD.MM) */
  preferDate: { type: String, default: '' },
})

const dayIso = ref('')

const days = computed(() =>
  [...foodDays]
    .map((d) => {
      const macrosDay = dayMacros(d)
      return {
        ...d,
        ...macrosDay,
        label: fromIsoDate(d.date),
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date)),
)

const selected = computed(() => days.value.find((d) => d.date === dayIso.value) || days.value.at(-1) || null)

watch(
  days,
  (list) => {
    if (!list.length) {
      dayIso.value = ''
      return
    }
    if (props.preferDate) {
      const hit = list.find((d) => d.label === props.preferDate)
      if (hit) {
        dayIso.value = hit.date
        return
      }
    }
    if (!list.some((d) => d.date === dayIso.value)) {
      dayIso.value = list[list.length - 1].date
    }
  },
  { immediate: true },
)

const protMid = computed(() => Math.round((meta.targetProtein[0] + meta.targetProtein[1]) / 2))
const kcalMid = computed(() => Math.round((meta.targetKcal[0] + meta.targetKcal[1]) / 2))

function ratio(fact, guide) {
  if (guide == null) return '—'
  return `${fact} / ${guide}`
}
</script>

<template>
  <div v-if="days.length" class="food-day-panel">
    <div class="food-day-tabs">
      <button
        v-for="d in [...days].reverse()"
        :key="d.date"
        type="button"
        class="food-day-tab"
        :data-active="d.date === selected?.date ? '1' : null"
        @click="dayIso = d.date"
      >
        <span class="food-day-d">{{ d.label }}</span>
        <span class="food-day-k">{{ d.kcal }}</span>
        <span class="food-day-p">{{ Math.round(d.p) }}б</span>
      </button>
    </div>

    <div v-if="selected" class="panel food-day" style="margin-top:0.65rem">
      <div class="food-day-head">
        <strong>{{ selected.label }}</strong>
        <span>факт / ориентир</span>
      </div>
      <p v-if="selected.note" class="note" style="margin:0.35rem 0 0">{{ selected.note }}</p>

      <ul v-if="selected.menu?.length" class="menu-list" style="margin-top:0.55rem">
        <li v-for="(m, i) in selected.menu" :key="'m'+i">
          <strong>{{ m.meal }}:</strong> {{ m.dishes }}
        </li>
      </ul>

      <div class="food-table-wrap">
        <table class="food-table">
          <thead>
            <tr>
              <th>Приём</th>
              <th>Продукт</th>
              <th>Кол-во</th>
              <th>ккал</th>
              <th>Б</th>
              <th>Ж</th>
              <th>У</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in selected.rows" :key="row.id + '-' + i">
              <td>{{ row.meal || '—' }}</td>
              <td>{{ row.name }}</td>
              <td>{{ amountLabel(row) }}</td>
              <td>{{ row.kcal }}</td>
              <td>{{ row.p }}</td>
              <td>{{ row.f }}</td>
              <td>{{ row.c }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Итого</strong></td>
              <td><strong>{{ selected.kcal }}</strong></td>
              <td><strong>{{ selected.p }}</strong></td>
              <td><strong>{{ selected.f }}</strong></td>
              <td><strong>{{ selected.c }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="food-vs-norm">
        <div class="vs-item">
          <span class="lbl">ккал</span>
          <span class="val">{{ ratio(selected.kcal, kcalMid) }}</span>
        </div>
        <div class="vs-item">
          <span class="lbl">Б</span>
          <span class="val">{{ ratio(selected.p, protMid) }}</span>
        </div>
        <div class="vs-item">
          <span class="lbl">Ж</span>
          <span class="val">{{ selected.f }}</span>
        </div>
        <div class="vs-item">
          <span class="lbl">У</span>
          <span class="val">{{ selected.c }}</span>
        </div>
      </div>
    </div>
  </div>
  <p v-else class="note">Пока нет дней с разбивкой по продуктам.</p>
</template>
