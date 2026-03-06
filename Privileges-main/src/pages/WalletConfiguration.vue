<script setup>
import { computed } from 'vue';
import { 
  Building2, ShieldCheck, RefreshCcw, Wallet, Clock, CheckCircle, ChevronRight, Settings, ShieldAlert
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp';
import { renderIcon } from '../utils/iconUtils';
 
const router = useRouter();
const { 
  permissions, branchConfig, getActiveBranchPerms, managingBranch, syncBranchPermissions, addLog
} = useApp();
 
const activeBranchPermIds = computed(() => getActiveBranchPerms());
 
const toggleBranchConfig = (permId) => {
  if (!branchConfig.value[permId]) {
    branchConfig.value[permId] = { enabled: false, validFrom: '', validTo: '' };
  }
  branchConfig.value[permId].enabled = !branchConfig.value[permId].enabled;
  
  const permName = permissions.value.find(p => p.id === permId)?.name;
  const status = branchConfig.value[permId].enabled ? 'เปิดการใช้งาน' : 'ระงับการใช้งาน';
  addLog('ตั้งค่าสาขา', `${status} ${permName} สำหรับสาขานี้`);
};
 
const updateBranchConfigDate = (permId, field, value) => {
  if (!branchConfig.value[permId]) {
    branchConfig.value[permId] = { enabled: false, validFrom: '', validTo: '' };
  }
  branchConfig.value[permId][field] = value;
};
 
const handleSync = () => {
    if (managingBranch.value) {
        syncBranchPermissions(managingBranch.value.id);
    }
};
</script>
 
<template>
  <div class="max-w-[1000px] mx-auto space-y-8 animate-in pb-20 px-4">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
      <div class="space-y-3">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">ตั้งค่ากระเป๋าสวัสดิการ</h2>
        <div class="flex flex-wrap items-center gap-3">
            <div class="px-4 py-2 bg-blue-600 shadow-xl shadow-blue-500/10 rounded-xl flex items-center gap-2">
                <Building2 :size="14" class="text-white" stroke-width="3" />
                <span class="text-[11px] font-medium text-white uppercase tracking-widest">{{ managingBranch?.name || 'GENERIC BRANCH' }}</span>
            </div>
            <p class="text-gray-400 text-[15px] font-medium tracking-tight uppercase">สิทธิ์ปัจจุบันและการควบคุมสถานะระดับสาขา</p>
        </div>
      </div>
      <div v-if="managingBranch?.pendingSync">
          <button @click="handleSync" class="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium uppercase tracking-widest text-sm shadow-2xl shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95">
              <RefreshCcw :size="20" stroke-width="3" class="animate-spin-slow" />
              อัปเดตข้อมูลจากส่วนกลาง
          </button>
      </div>
    </div>
 
    <!-- Active Summary Panel -->
    <div class="relative overflow-hidden rounded-3xl bg-gray-900 shadow-xl border border-gray-800 p-8">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
        <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div class="space-y-3 text-center lg:text-left">
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
                    <ShieldCheck :size="12" class="text-blue-400" />
                    <span class="text-[10px] font-medium uppercase tracking-widest text-blue-400">Security Verified</span>
                </div>
                <h3 class="text-2xl font-medium text-white tracking-tight uppercase">ศูนย์ประสานงานสวัสดิการสาขา</h3>
                <p class="text-gray-400 text-sm font-medium max-w-md mx-auto lg:mx-0">ตรวจสอบและควบคุมสถานะการเปิดรับสวัสดิการแบบระดับสาขาได้อย่างอิสระ</p>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl text-center min-w-[110px]">
                    <p class="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">ทั้งหมด</p>
                    <p class="text-3xl font-medium text-white">{{ activeBranchPermIds.length }}</p>
                </div>
                <div class="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl text-center min-w-[110px]">
                    <p class="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-1">พร้อมใช้</p>
                    <p class="text-3xl font-medium text-green-400">
                        {{ activeBranchPermIds.filter(pid => branchConfig[pid]?.enabled).length }}
                    </p>
                </div>
            </div>
        </div>
    </div>
 
    <!-- Configuration Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
      <div v-for="pid in activeBranchPermIds" :key="pid">
        <div v-if="permissions.find(p => p.id === pid)" 
          class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 relative overflow-hidden"
          :class="branchConfig[pid]?.enabled ? 'border-blue-200 bg-blue-50/5' : 'opacity-80'"
        >
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-4">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm"
                :class="branchConfig[pid]?.enabled ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-300'"
              >
                <component :is="renderIcon(permissions.find(p => p.id === pid).icon, 20)" stroke-width="2.5" />
              </div>
              <div>
                <h3 class="font-medium text-lg text-gray-900 tracking-tight">{{ permissions.find(p => p.id === pid).name }}</h3>
                <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-medium uppercase text-gray-300">ID: {{ pid }}</span>
                    <span class="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        ฿{{ (permissions.find(p => p.id === pid).totalValue || permissions.find(p => p.id === pid).value).toLocaleString() }}
                    </span>
                </div>
              </div>
            </div>
            
            <button 
              @click="toggleBranchConfig(pid)"
              class="w-11 h-6 rounded-full relative transition-all duration-300 outline-none flex items-center px-0.5"
              :class="branchConfig[pid]?.enabled ? 'bg-green-500 shadow-md' : 'bg-gray-200'"
            >
                <div 
                  class="h-5 w-5 bg-white rounded-full transition-all duration-300 shadow-sm"
                  :class="branchConfig[pid]?.enabled ? 'translate-x-[20px]' : ''"
                ></div>
            </button>
          </div>
          
          <div class="h-px bg-gray-50 w-full mb-6"></div>
 
          <div class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">มีผลเริ่มต้น</label>
                    <input 
                      type="date" 
                      :disabled="!branchConfig[pid]?.enabled"
                      :value="branchConfig[pid]?.validFrom" 
                      @input="e => updateBranchConfigDate(pid, 'validFrom', e.target.value)" 
                      class="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs font-medium text-gray-900 outline-none disabled:opacity-30" 
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-gray-400 uppercase tracking-widest ml-1">สิ้นสุดสิทธิ์</label>
                    <input 
                      type="date" 
                      :disabled="!branchConfig[pid]?.enabled"
                      :value="branchConfig[pid]?.validTo" 
                      @input="e => updateBranchConfigDate(pid, 'validTo', e.target.value)" 
                      class="w-full px-3 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs font-medium text-gray-900 outline-none disabled:opacity-30" 
                    />
                  </div>
              </div>
 
              <div v-if="branchConfig[pid]?.enabled" class="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle :size="14" class="text-green-500" />
                  <span class="text-xs font-medium text-green-600">เปิดรับสวัสดิการในระบบแล้ว</span>
              </div>
              <div v-else class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 opacity-60">
                  <ShieldAlert :size="14" class="text-gray-300" />
                  <span class="text-xs font-medium text-gray-400">ระงับการรับสวัสดิการชั่วคราว</span>
              </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="activeBranchPermIds.length === 0" class="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-6">
          <div class="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center text-gray-200">
              <Wallet :size="40" />
          </div>
          <div class="space-y-1.5 px-10">
              <p class="text-xl font-medium text-gray-900 tracking-tight uppercase">ไม่พบสิทธิ์รอการตั้งค่า</p>
              <p class="text-sm font-medium text-gray-400 uppercase max-w-sm">แอดมินส่วนกลางยังไม่ได้กำหนดสิทธิ์กลางให้กับสาขานี้</p>
          </div>
          <button @click="router.push('/branches')" class="px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95">กลับไปหน้าการจัดการส่วนกลาง</button>
      </div>
    </div>
  </div>
</template>
 
<style scoped>
.animate-spin-slow {
  animation: spin 3s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
