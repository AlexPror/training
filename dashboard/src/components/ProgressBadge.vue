<script setup>
defineProps({
  label: { type: String, default: null },
  tone: { type: String, default: 'flat' },
})
</script>

<template>
  <span
    v-if="label"
    class="progress-badge"
    :data-tone="tone"
    :title="'к прошлому разу: ' + label"
  >{{ label }}</span>
</template>
