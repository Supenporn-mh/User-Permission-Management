<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { provideApp } from './composables/useApp';
import Sidebar from './components/layout/Sidebar.vue';
import Toast from './components/ui/Toast.vue';
import { Search, Bell } from 'lucide-vue-next';
 
const context = provideApp();
const { userRole, isLoggedIn } = context;
const route = useRoute();
 
const currentLabel = computed(() => route.meta?.label || 'หน้าหลัก');
</script>
 
<template>
  <div v-if="!isLoggedIn">
    <router-view />
  </div>
  <div v-else class="flex h-screen w-full bg-[#F7F7F7] overflow-hidden font-sans antialiased text-gray-900">
    <!-- Main Sidebar Component -->
    <Sidebar />
 
    <!-- Main Content Container -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      <!-- Minimal Top Bar -->
      <header class="h-16 flex items-center justify-between px-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 shrink-0 z-10 w-full shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-gray-400">
            <span class="hover:text-blue-600 cursor-pointer transition-all">{{ userRole }}</span>
            <span class="opacity-20">/</span>
            <span class="text-gray-900 font-medium">{{ currentLabel }}</span>
          </div>
        </div>
 
        <div class="flex items-center gap-6">
          <button class="text-gray-400 hover:text-gray-900 transition-all p-1 hover:scale-110 active:scale-90"><Search :size="20" stroke-width="2.5" /></button>
          <button class="text-gray-400 hover:text-gray-900 transition-all p-1 relative hover:scale-110 active:scale-90">
            <Bell :size="20" stroke-width="2.5" />
            <div class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
          <div class="h-5 w-px bg-gray-100 mx-1"></div>
          <button class="bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 shadow-sm rounded-xl px-5 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-all active:scale-95 uppercase tracking-widest">ช่วยเหลือ</button>
        </div>
      </header>
 
      <!-- Page Content: Scrollable -->
      <div class="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div class="max-w-[1240px] mx-auto py-12 px-10 mb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <router-view v-slot="{ Component }">
            <transition 
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-2 scale-[0.99]"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0 scale-[0.99]"
              mode="out-in"
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
 
    <!-- Global Components -->
    <Toast />
  </div>
</template>
 
<style>
html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
