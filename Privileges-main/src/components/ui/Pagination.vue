<script setup>
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-vue-next';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  pageSizeOptions: { type: Array, default: () => [10, 20, 50, 100] }
});

const emit = defineEmits(['update:currentPage', 'update:pageSize']);

const pages = computed(() => {
  const current = props.currentPage;
  const total = props.totalPages;
  const delta = 2;
  const left = current - delta;
  const right = current + delta + 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

const handlePageChange = (p) => {
  if (p === '...' || p === props.currentPage) return;
  emit('update:currentPage', p);
};

const handlePageSizeChange = (event) => {
  emit('update:pageSize', parseInt(event.target.value));
  emit('update:currentPage', 1);
};
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-8 bg-gray-50/10 border-t border-gray-50 rounded-b-3xl">
    <!-- Left: Status & Page Size -->
    <div class="flex items-center gap-6">
      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
        ทั้งหมด {{ totalItems }} รายการ
      </p>
      
      <div class="h-4 w-px bg-gray-200"></div>

      <div class="flex items-center gap-3 group">
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap group-hover:text-gray-900 transition-colors">
          แสดงผล
        </label>
        <div class="relative">
          <select 
            :value="pageSize" 
            @change="handlePageSizeChange"
            class="appearance-none bg-gray-900 text-white text-[10px] font-bold px-4 py-2 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer uppercase tracking-widest"
          >
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }} รายการ</option>
          </select>
          <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
            <ChevronLeft class="rotate-[-90deg]" :size="10" stroke-width="4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Page Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous -->
      <button 
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-all stroke-[3]"
        :class="currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-gray-200/50 active:scale-90 border border-transparent hover:border-gray-100'"
      >
        <ChevronLeft :size="18" />
      </button>

      <!-- Page Pills -->
      <div class="flex items-center gap-1.5">
        <template v-for="(p, i) in pages" :key="i">
          <button 
            v-if="p !== '...'"
            @click="handlePageChange(p)"
            class="min-w-[40px] h-10 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center uppercase tracking-widest"
            :class="p === currentPage 
              ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-110 z-10' 
              : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100 shadow-sm shadow-transparent hover:shadow-gray-200/50'"
          >
            {{ p }}
          </button>
          <div v-else class="w-10 h-10 flex items-center justify-center text-gray-300">
            <MoreHorizontal :size="16" stroke-width="3" />
          </div>
        </template>
      </div>

      <!-- Next -->
      <button 
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-all stroke-[3]"
        :class="currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-gray-200/50 active:scale-90 border border-transparent hover:border-gray-100'"
      >
        <ChevronRight :size="18" />
      </button>
    </div>
  </div>
</template>
