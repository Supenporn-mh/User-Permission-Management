<script setup>
defineProps({
  icon: { type: Object, default: null },
  title: { type: String, default: 'ไม่พบข้อมูล' },
  subtitle: { type: String, default: '' },
  actionLabel: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<template>
  <div class="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
    <div v-if="icon" class="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 border border-gray-100">
      <component :is="icon" :size="40" stroke-width="1.5" />
    </div>
    <div class="space-y-1.5">
      <p class="text-xl font-medium text-gray-900 italic tracking-tight">{{ title }}</p>
      <p v-if="subtitle" class="text-sm text-gray-400 font-medium tracking-wide max-w-sm">{{ subtitle }}</p>
    </div>
    <button 
      v-if="actionLabel"
      @click="$emit('action')"
      class="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95"
    >
      {{ actionLabel }}
    </button>
    <slot />
  </div>
</template>
