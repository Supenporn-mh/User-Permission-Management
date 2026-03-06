<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Building2, Users, ShieldCheck, History, Wallet, Settings, 
  ChevronRight, LayoutDashboard, Database, Briefcase, ArrowLeft
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

const goBackToOrg = () => {
  managingBranch.value = null;
  router.push('/branches');
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
  { path: '/employee-groups', label: 'กลุ่มพนักงาน',    icon: Database },
  { path: '/employees',      label: 'รายชื่อพนักงาน',  icon: Users },
];

const isManaging = computed(() => !!managingBranch.value);
 
const currentMenuItems = computed(() => {
  if (userRole.value === 'admin') {
    if (isManaging.value) {
      return branchMenu;
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
    <div class="w-64 flex flex-col bg-white border-r border-gray-100/50">
      <div class="px-6 py-8">
        <!-- Back Button: ONLY for System Admin in Managing Mode -->
        <div v-if="isManaging && userRole === 'admin'" class="mb-8 px-1 animate-in slide-in-from-left-4 duration-500">
            <button @click="goBackToOrg" 
                class="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-sm transition-all active:scale-95 group">
                <ArrowLeft :size="16" class="text-gray-400 group-hover:text-blue-500 group-hover:-translate-x-0.5 transition-all" />
                <span class="text-[12px] font-bold uppercase tracking-widest">กลับสู่ระดับองค์กร</span>
            </button>
        </div>

        <h2 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 px-4 opacity-80">
          {{ userRole === 'admin' ? (isManaging ? 'จัดการข้อมูลภายใน' : 'การควบคุมส่วนกลาง') : 'การจัดการส่วนสาขา' }}
        </h2>
        
        <nav class="space-y-2.5 px-1">
          <button 
            v-for="item in currentMenuItems" 
            :key="item.path"
            @click="router.push(item.path)"
            class="sidebar-link group w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all border-none cursor-pointer text-left relative overflow-hidden"
            :class="[
                isActive(item.path) 
                    ? (isManaging && userRole === 'admin' ? 'bg-[#2EB06E] text-white shadow-xl shadow-green-500/10' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/10')
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-50'
            ]"
          >
            <component 
              :is="item.icon" 
              :size="19" 
              :class="isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'"
              stroke-width="2.5"
            />
            <span class="text-[14px] font-medium tracking-tight">{{ item.label }}</span>

            <!-- Active Indicator for Light Mode -->
            <div v-if="isActive(item.path)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/40 rounded-r-full"></div>
          </button>
        </nav>
      </div>

      <!-- User Profile & Logout -->
      <div class="mt-auto p-6 border-t bg-gray-50/20 border-gray-50 space-y-4">
        <div class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border bg-blue-50 text-blue-600 border-blue-100">
            {{ currentUser?.name?.charAt(0) || 'U' }}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[14.5px] font-bold text-gray-900 truncate">{{ currentUser?.name || 'ผู้ใช้งาน' }}</span>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ userRole === 'admin' ? 'แอดมินระบบ' : 'แอดมินสาขา' }}</span>
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
