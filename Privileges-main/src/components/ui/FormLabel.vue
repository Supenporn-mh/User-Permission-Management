<script setup>
defineProps({
  label: { type: String, default: '' },
  required: { type: Boolean, default: false }
})
</script>

<template>
  <label class="text-[10px] font-medium text-gray-400 uppercase tracking-widest pl-1">
    {{ label }}
    <span v-if="required" class="text-red-400">*</span>
  </label>
</template>
