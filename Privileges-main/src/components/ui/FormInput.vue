<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input 
    :type="type"
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full px-4 py-4 bg-gray-50 rounded-xl text-gray-900 font-medium placeholder-gray-300 border border-transparent focus:border-blue-100 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
  />
</template>
