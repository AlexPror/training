<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String,
  delta: String,
  deltaClass: { type: String, default: '' },
})
</script>

<template>
  <div class="kpi">
    <div class="lbl">{{ label }}</div>
    <div class="val">{{ value }}</div>
    <div class="hint">
      <span v-if="delta" :class="deltaClass">{{ delta }}</span>
      <span v-if="hint">{{ hint }}</span>
    </div>
  </div>
</template>
