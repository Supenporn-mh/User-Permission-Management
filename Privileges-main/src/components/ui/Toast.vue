<script setup>
import { CheckCircle, AlertCircle, X } from 'lucide-vue-next';
import { useApp } from '../../composables/useApp';

const { toast } = useApp();
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="toast.show" class="fixed top-6 right-6 z-[200] max-w-sm w-full bg-white shadow-2xl rounded-2xl border border-gray-100 pointer-events-auto overflow-hidden ring-1 ring-black ring-opacity-5">
      <div class="p-5">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <CheckCircle v-if="toast.type === 'success'" class="h-6 w-6 text-green-500" aria-hidden="true" />
            <AlertCircle v-else class="h-6 w-6 text-red-500" aria-hidden="true" />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900 uppercase tracking-tight">
              {{ toast.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด' }}
            </p>
            <p class="mt-1 text-[13px] font-medium text-gray-500 leading-tight">
              {{ toast.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button @click="toast.show = false" class="bg-white rounded-lg inline-flex text-gray-300 hover:text-gray-900 focus:outline-none p-1 transition-colors">
              <span class="sr-only">Close</span>
              <X class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <!-- Progress Bar -->
      <div class="h-1 bg-gray-50 w-full overflow-hidden">
          <div 
            class="h-full transition-all duration-3000 ease-linear"
            :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
            :style="{ width: toast.show ? '0%' : '100%', transitionDuration: '3000ms' }"
          ></div>
      </div>
    </div>
  </Transition>
</template>
