<script setup>
defineProps({
  type: {
    type: String,
    default: 'default'
  }
})

const BADGE_STYLES = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Inactive: 'bg-red-50 text-red-700 border-red-100',
  Hospital: 'bg-blue-50 text-blue-700 border-blue-100',
  Factory: 'bg-orange-50 text-orange-700 border-orange-100',
  School: 'bg-purple-50 text-purple-700 border-purple-100',
  Canteen: 'bg-pink-50 text-pink-700 border-pink-100',
  auto_reset: 'bg-blue-50 text-blue-600 border-blue-100',
  top_up: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  default: 'bg-gray-50 text-gray-600 border-gray-200'
}
</script>

<template>
  <span 
    class="px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wider"
    :class="BADGE_STYLES[type] || BADGE_STYLES.default"
  >
    <slot />
  </span>
</template>
