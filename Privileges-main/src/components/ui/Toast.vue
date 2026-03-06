<script setup>
import { CheckCircle, AlertCircle, Info } from 'lucide-vue-next';
import { useApp } from '../../composables/useApp';

const { toast } = useApp();
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-[-20px] opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-[-20px]"
  >
    <div v-if="toast.show" 
         class="fixed top-8 right-8 z-[9999] min-w-[380px] max-w-lg pointer-events-none overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-stretch border border-white/10"
         :class="toast.type === 'success' ? 'bg-[#2EB06E]' : toast.type === 'info' ? 'bg-blue-600' : 'bg-[#E53E3E]'">
      
      <!-- Side Accent Icon -->
      <div class="w-20 flex items-center justify-center bg-black/10 backdrop-blur-sm px-6">
        <CheckCircle v-if="toast.type === 'success'" class="h-8 w-8 text-white/90" stroke-width="2.5" />
        <Info v-else-if="toast.type === 'info'" class="h-8 w-8 text-white/90" stroke-width="2.5" />
        <AlertCircle v-else class="h-8 w-8 text-white/90" stroke-width="2.5" />
      </div>

      <!-- Content Area -->
      <div class="flex-1 py-7 px-8 flex items-center min-h-[90px]">
        <div class="space-y-1">
          <p class="text-[17px] font-semibold text-white tracking-tight leading-snug">
            {{ toast.message }}
          </p>
          <p class="text-[11px] font-medium text-white/60 uppercase tracking-widest">
            {{ toast.type === 'success' ? 'อัปเดตข้อมูลสำเร็จ' : toast.type === 'info' ? 'ข้อมูลระบบ' : 'เกิดข้อผิดพลาดในการดำเนินการ' }}
          </p>
        </div>
      </div>

      <!-- Subtle Auto-hide Progress (Bottom) -->
      <div class="absolute bottom-0 left-0 h-1 bg-black/20 w-full overflow-hidden">
          <div 
            class="h-full bg-white/40 transition-all ease-linear"
            :style="{ width: toast.show ? '100%' : '0%', transitionDuration: '3000ms' }"
          ></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Glassmorphism subtle effect if needed */
.glass-toast {
  backdrop-filter: blur(16px) saturate(180%);
}
</style>
