<script setup>
import { X } from 'lucide-vue-next';
 
defineProps({
  isOpen: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md'
  }
})
 
defineEmits(['close'])
 
const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl'
}
</script>
 
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
    <!-- Overlay -->
    <div @click="$emit('close')" class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"></div>
    
    <!-- Modal Content -->
    <div 
      class="relative bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] flex flex-col transition-all overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
      :class="SIZE_CLASSES[size] || 'max-w-md'"
    >
      <!-- Header -->
      <div class="px-8 py-6 flex items-center justify-between border-b border-gray-50 bg-white sticky top-0 z-10">
        <h3 class="text-lg font-medium tracking-tight text-gray-900 uppercase">{{ title }}</h3>
        <button 
          @click="$emit('close')"
          class="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 active:scale-90"
        >
          <X :size="20" stroke-width="3" />
        </button>
      </div>
      
      <!-- Body -->
      <div class="px-8 py-6 overflow-y-auto custom-scrollbar flex-1">
        <slot />
      </div>
      
      <!-- Footer -->
      <div v-if="$slots.footer" class="border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3 shrink-0">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
 
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
</style>
