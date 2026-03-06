<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

defineProps({
  columns: {
    type: Array,
    required: true
    // Array of { key: string, label: string, align?: 'left'|'right'|'center', width?: string }
  },
  items: { type: Array, default: () => [] },
  totalLabel: { type: String, default: '' },
  showCheckbox: { type: Boolean, default: false }
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100/50">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50/30 border-b border-gray-50">
            <th v-if="showCheckbox" class="w-14 py-4 px-6 text-left">
              <input type="checkbox" class="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </th>
            <th 
              v-for="col in columns" 
              :key="col.key"
              class="py-4 px-4 text-[10px] font-medium text-gray-400 uppercase tracking-[0.15em]"
              :class="[
                col.align === 'right' ? 'text-right pr-8' : 'text-left',
                col.width || ''
              ]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <slot />
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="totalLabel" class="px-6 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/20">
      <p class="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{{ totalLabel }}</p>
      <div class="flex items-center gap-1.5">
        <button class="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"><ChevronLeft :size="16" /></button>
        <div class="flex items-center gap-1 px-1">
          <slot name="pagination">
            <button class="w-8 h-8 rounded-lg bg-gray-900 text-white text-[12px] font-medium">1</button>
          </slot>
        </div>
        <button class="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"><ChevronRight :size="16" /></button>
      </div>
    </div>
  </div>
</template>
