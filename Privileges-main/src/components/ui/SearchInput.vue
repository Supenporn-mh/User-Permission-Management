<script setup>
import { Search } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'ค้นหา...' }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative flex-1 group">
    <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="18" />
    <input 
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder" 
      class="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-[14.5px] font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
    />
  </div>
</template>
