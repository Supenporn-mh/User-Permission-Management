<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Building2, Users, ShieldCheck, History, Wallet, Settings, 
  ChevronRight, LayoutDashboard, Database, Briefcase
} from 'lucide-vue-next';
import { useApp } from '../../composables/useApp';
 
const { userRole, setUserRole, logout, currentUser, managingBranch } = useApp();
const router = useRouter();
const route = useRoute();
 
// Workspace Switching Logic
const switchWorkspace = (role) => {
  setUserRole(role);
  if (role === 'admin') router.push('/branches');
  else router.push('/wallet-config');
};

const handleLogout = () => {
  logout();
  router.push('/login');
};
 
const adminMenu = [
  { path: '/branches',           label: 'การจัดการสาขา',       icon: Building2 },
  { path: '/user-management',    label: 'จัดการผู้ใช้งาน',       icon: Users },
  { path: '/master-permissions', label: 'สิทธิ์สวัสดิการกลาง',  icon: ShieldCheck },
  { path: '/audit-logs',         label: 'ประวัติการทำรายการ',   icon: History }
];
 
const branchMenu = [
  { path: '/wallet-config',  label: 'ตั้งค่า Wallet',  icon: Wallet },
  { path: '/employee-groups', label: 'กลุ่มพนักงาน',   icon: Database },
  { path: '/employees',      label: 'รายชื่อพนักงาน', icon: Users },
];
 
const currentMenuItems = computed(() => {
  if (userRole.value === 'admin') {
    if (managingBranch.value) {
      return [...adminMenu, ...branchMenu];
    }
    return adminMenu;
  }
  return branchMenu;
});
 
const isActive = (path) => route.path === path;
</script>
 
<template>
  <aside class="flex h-full flex-shrink-0 border-r border-gray-100 bg-[#F7F7F7]">
    <!-- Column 1: Workspace Selector -->
    <div class="w-[72px] flex flex-col items-center py-8 gap-6 border-r border-gray-100/50 shadow-inner">
      <div 
        @click="switchWorkspace('admin')"
        class="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all relative group"
        :class="userRole === 'admin' ? 'bg-white shadow-xl shadow-blue-500/10' : 'hover:bg-white/50'"
        title="Admin Dashboard"
      >
        <ShieldCheck :size="22" :class="userRole === 'admin' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'" />
        <div v-if="userRole === 'admin'" class="absolute -left-[1px] w-[4px] h-6 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50"></div>
      </div>
 
      <div 
        @click="switchWorkspace('branch')"
        class="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all relative group"
        :class="userRole === 'branch' ? 'bg-white shadow-xl shadow-blue-500/10' : 'hover:bg-white/50'"
        title="Branch Interface"
      >
        <Building2 :size="22" :class="userRole === 'branch' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'" />
        <div v-if="userRole === 'branch'" class="absolute -left-[1px] w-[4px] h-6 bg-blue-500 rounded-r-full shadow-lg shadow-blue-500/50"></div>
      </div>
    </div>
 
    <!-- Column 2: Navigation Menu -->
    <div class="w-64 flex flex-col bg-white">
      <div class="px-6 py-10">
        <h2 class="text-xs font-medium text-gray-400 uppercase tracking-widest mb-10 px-2 opacity-80">
          {{ userRole === 'admin' ? 'การควบคุมส่วนกลาง' : 'การจัดการส่วนสาขา' }}
        </h2>
        
        <nav class="space-y-2">
          <button 
            v-for="item in currentMenuItems" 
            :key="item.path"
            @click="router.push(item.path)"
            class="sidebar-link group w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all border-none cursor-pointer text-left"
            :class="isActive(item.path) ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
          >
            <component 
              :is="item.icon" 
              :size="18" 
              :class="isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'"
              stroke-width="2.5"
            />
            <span class="text-sm font-medium tracking-tight">{{ item.label }}</span>
          </button>
        </nav>
      </div>
 
      <!-- User Profile & Logout -->
      <div class="mt-auto p-6 border-t border-gray-50 bg-gray-50/20 space-y-4">
        <div class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100">
            {{ currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-gray-900 truncate">{{ currentUser?.name || 'ผู้ใช้งาน' }}</span>
            <span class="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{{ userRole === 'admin' ? 'แอดมินระบบ' : 'แอดมินสาขา' }}</span>
          </div>
        </div>
        
        <button 
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-3 py-3 rounded-lg border-2 border-red-50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  </aside>
</template>
 
<style scoped>
.sidebar-link {
  -webkit-tap-highlight-color: transparent;
}
</style>
