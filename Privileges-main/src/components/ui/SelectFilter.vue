<script setup>
import { ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: {
    type: Array,
    required: true
    // Array of { value: string, label: string } or just strings
  },
  icon: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])

const getLabel = (opt) => typeof opt === 'string' ? opt : opt.label
const getValue = (opt) => typeof opt === 'string' ? opt : opt.value
</script>

<template>
  <div class="relative min-w-[160px]">
    <component v-if="icon" :is="icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
    <select 
      :value="modelValue"
      @change="emit('update:modelValue', $event.target.value)"
      class="w-full pr-10 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-600 appearance-none cursor-pointer outline-none shadow-sm hover:bg-gray-50 transition-all"
      :class="icon ? 'pl-12' : 'pl-4'"
    >
      <option v-for="opt in options" :key="getValue(opt)" :value="getValue(opt)">{{ getLabel(opt) }}</option>
    </select>
    <ChevronRight class="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" :size="14" />
  </div>
</template>
