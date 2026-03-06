<script setup>
defineProps({
  status: {
    type: String,
    default: 'default'
  },
  dot: { type: Boolean, default: true }
})

const STATUS_MAP = {
  active:   { bg: 'bg-green-50',  text: 'text-green-600', dot: 'bg-green-500',  label: 'เปิดใช้งาน' },
  inactive: { bg: 'bg-gray-100',  text: 'text-gray-400',  dot: 'bg-gray-400',   label: 'ระงับการใช้งาน' },
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-600', dot: 'bg-amber-500',  label: 'รอดำเนินการ' },
  disabled: { bg: 'bg-red-50',    text: 'text-red-500',   dot: 'bg-red-500',    label: 'ปิดการใช้งาน' },
  success:  { bg: 'bg-green-50',  text: 'text-green-600', dot: 'bg-green-500',  label: 'สำเร็จ' },
  error:    { bg: 'bg-red-50',    text: 'text-red-500',   dot: 'bg-red-500',    label: 'ล้มเหลว' },
  default:  { bg: 'bg-gray-50',   text: 'text-gray-500',  dot: 'bg-gray-400',   label: '' }
}

const getConfig = (s) => STATUS_MAP[s?.toLowerCase()] || STATUS_MAP.default
</script>

<template>
  <div 
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-tighter"
    :class="[getConfig(status).bg, getConfig(status).text]"
  >
    <div v-if="dot" class="w-1 h-1 rounded-full" :class="getConfig(status).dot"></div>
    <slot>{{ getConfig(status).label }}</slot>
  </div>
</template>
