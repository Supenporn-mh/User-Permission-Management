<script setup>
import { Plus } from 'lucide-vue-next';

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'dark'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  icon: { type: Object, default: null },
  block: { type: Boolean, default: false }
})

const VARIANT_CLASSES = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-white border border-gray-100 text-gray-700 shadow-sm hover:bg-gray-50',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
  dark: 'bg-gray-900 hover:bg-black text-white shadow-xl'
}

const SIZE_CLASSES = {
  sm: 'px-3 py-2 text-xs gap-1.5',
  md: 'px-5 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-sm gap-3'
}
</script>

<template>
  <button
    class="rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center"
    :class="[
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      block ? 'w-full' : ''
    ]"
  >
    <component v-if="icon" :is="icon" :size="size === 'sm' ? 14 : 18" :stroke-width="3" />
    <slot />
  </button>
</template>
