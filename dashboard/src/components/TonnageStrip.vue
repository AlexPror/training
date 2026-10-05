<script setup>
import { computed } from 'vue'
import { formatTonnageKg } from '@/lib/tonnage'

const props = defineProps({
  tonnage: { type: Object, required: true },
})

const hasKg = computed(() => (props.tonnage?.totalKg || 0) > 0)
const slices = computed(() =>
  Object.entries(props.tonnage?.byMovement || {})
    .map(([id, v]) => ({ id, label: v.label || id, kg: v.kg }))
    .sort((a, b) => b.kg - a.kg)
    .slice(0, 4),
)
</script>

<template>
  <div v-if="hasKg" class="tonnage-strip">
    <div class="tonnage-total">
      <span class="tonnage-lbl">Тонаж</span>
      <strong>{{ formatTonnageKg(tonnage.totalKg) }}</strong>
      <span class="hint">снаряд</span>
    </div>
    <div v-if="slices.length" class="tonnage-slices">
      <div v-for="s in slices" :key="s.id" class="tonnage-slice">
        <span>{{ s.label }}</span>
        <strong>{{ formatTonnageKg(s.kg) }}</strong>
      </div>
    </div>
  </div>
</template>
