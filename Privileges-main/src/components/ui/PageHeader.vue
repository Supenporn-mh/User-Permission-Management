<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="space-y-1.5 px-2">
    <h2 class="text-2xl font-medium tracking-tight text-gray-900">{{ title }}</h2>
    <p v-if="subtitle" class="text-sm text-gray-400 font-medium tracking-wide">{{ subtitle }}</p>
    <slot />
  </div>
</template>
