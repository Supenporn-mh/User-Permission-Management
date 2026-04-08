<script setup>
import { ref, computed } from 'vue';
import {
  Search, Filter, Shield, MoreHorizontal, Edit, Trash2, Calendar, Clock,
  CheckCircle, Landmark, Wallet, Gift, Coffee, Car, ChevronRight, Building2, Info, RefreshCcw,
  Users, Plus, ChevronLeft, Check, AlertCircle, Utensils, X
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import MultiSelectDropdown from '../components/ui/MultiSelectDropdown.vue';
import { useApp } from '../composables/useApp';
import { WEEK_DAYS } from '../data/mockData';
 
const { 
  permissions, branches,
  addPermission, updatePermission, deletePermission, togglePermissionStatus 
} = useApp();
 
const searchTerm = ref('');
const filterType = ref('All');
const activeMenuId = ref(null);
 
// Modal states
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isUsageModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedPerm = ref(null);
 
// Form state
const permForm = ref({
  name: '',
  type: 'auto_reset', // 'auto_reset' | 'top_up' | 'meal_allowance'
  icon: 'Gift',

  // Logic
  frequency: 'Daily', // 'Daily', 'Weekly', 'Monthly', 'Matrix'
  timesPerDay: 3,
  timesPerWeek: null,
  timesPerMonth: null,
  timesPerCycle: null,
  amountPerTimeDaily: 50,
  amountPerTimeWeekly: null,
  amountPerTimeMonthly: null,
  amountPerTime: 50,
  totalValue: 150,
  allowRollover: false,

  // Sub-configs
  specificWeeks: [1, 2, 3, 4],
  monthlyCycleType: 'full_month',
  monthlyDates: [],
  monthlySpecificDay: 25,
  matrixDays: [],
  topUpRoles: ['admin'],
  amountPerTimeScope: 'per_day',
  allowNegative: false,
  negativeLimit: 0,

  // Meal Allowance
  timeWindowsEnabled: false,
  timeWindows: [{ start: '11:00', end: '13:30' }],
  workingDaysOnly: true,
  activeWeekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  excludePublicHolidays: true
});
 
const filteredPerms = computed(() => {
  return permissions.value.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
                         p.id.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesFilter = filterType.value === 'All' || p.type === filterType.value;
    return matchesSearch && matchesFilter;
  });
});
 
const getIconComponent = (iconName) => {
  const icons = { Gift, Coffee, Car, Wallet, Landmark, Shield, Utensils };
  return icons[iconName] || Gift;
};

// Type badge helpers
const getTypeBadgeLabel = (type) => {
  if (type === 'auto_reset') return 'RESET';
  if (type === 'top_up') return 'TOP-UP';
  if (type === 'meal_allowance') return 'MEAL';
  return type;
};
const getTypeBadgeClass = (type) => {
  if (type === 'auto_reset') return 'bg-blue-600 text-white';
  if (type === 'top_up') return 'bg-[#E3EFFF] text-[#007AFF]';
  if (type === 'meal_allowance') return 'bg-emerald-600 text-white';
  return 'bg-gray-100 text-gray-500';
};
 
const getActiveBranches = (permId) => {
  return branches.value.filter(b => b.permissions.includes(permId));
};
 
// Actions
const openAddModal = () => {
  permForm.value = {
    name: '', type: 'auto_reset', icon: 'Gift', fundTypes: ['Standard'],
    frequency: 'Daily',
    timesPerDay: 3, timesPerWeek: null, timesPerMonth: null, timesPerCycle: null,
    amountPerTimeDaily: 50, amountPerTimeWeekly: null,
    amountPerTime: 50, totalValue: 150, allowRollover: false,
    specificWeeks: [1, 2, 3, 4], monthlyCycleType: 'full_month', monthlyDates: [],
    monthlySpecificDay: 25, matrixDays: [], topUpRoles: ['admin'], amountPerTimeScope: 'per_day',
    allowNegative: false, negativeLimit: 0,
    // Meal Allowance
    timeWindowsEnabled: false,
    timeWindows: [{ start: '11:00', end: '13:30' }],
    workingDaysOnly: true,
    activeWeekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    excludePublicHolidays: true
  };
  isAddModalOpen.value = true;
};
 
const openEditModal = (perm) => {
  selectedPerm.value = perm;
  permForm.value = {
    ...perm,
    timesPerMonth: perm.timesPerMonth !== undefined ? perm.timesPerMonth : null,
    amountPerTimeDaily: perm.amountPerTimeDaily !== undefined ? perm.amountPerTimeDaily : perm.amountPerTime,
    amountPerTimeWeekly: perm.amountPerTimeWeekly !== undefined ? perm.amountPerTimeWeekly : null,
    specificWeeks: perm.specificWeeks || [1, 2, 3, 4],
    monthlyDates: perm.monthlyDates || [],
    matrixDays: perm.matrixDays || [],
    topUpRoles: perm.topUpRoles || ['admin'],
    amountPerTimeScope: perm.amountPerTimeScope || 'per_day',
    allowNegative: perm.allowNegative || false,
    negativeLimit: perm.negativeLimit || 0,
    // Meal Allowance
    timeWindowsEnabled: perm.timeWindowsEnabled !== undefined ? perm.timeWindowsEnabled : false,
    timeWindows: perm.timeWindows ? perm.timeWindows.map(w => ({ ...w })) : [{ start: '11:00', end: '13:30' }],
    workingDaysOnly: perm.workingDaysOnly !== undefined ? perm.workingDaysOnly : false,
    activeWeekDays: perm.activeWeekDays ? [...perm.activeWeekDays] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    excludePublicHolidays: perm.excludePublicHolidays !== undefined ? perm.excludePublicHolidays : false
  };
  isEditModalOpen.value = true;
  activeMenuId.value = null;
};
 
const openUsageModal = (perm) => {
  selectedPerm.value = perm;
  isUsageModalOpen.value = true;
  activeMenuId.value = null;
};
 
const openDeleteModal = (perm) => {
  selectedPerm.value = perm;
  isDeleteModalOpen.value = true;
  activeMenuId.value = null;
};
 
const handleSave = () => {
  if (isAddModalOpen.value) {
    addPermission(permForm.value);
    isAddModalOpen.value = false;
  } else {
    updatePermission(selectedPerm.value.id, permForm.value);
    isEditModalOpen.value = false;
  }
};
 
const toggleMatrixDay = (day) => {
  const idx = permForm.value.matrixDays.indexOf(day);
  if (idx === -1) permForm.value.matrixDays.push(day);
  else permForm.value.matrixDays.splice(idx, 1);
};
 
const toggleMonthlyDate = (day) => {
  const idx = permForm.value.monthlyDates.indexOf(day);
  if (idx === -1) permForm.value.monthlyDates.push(day);
  else permForm.value.monthlyDates.splice(idx, 1);
};
 
const toggleWeek = (week) => {
  const idx = permForm.value.specificWeeks.indexOf(week);
  if (idx === -1) permForm.value.specificWeeks.push(week);
  else permForm.value.specificWeeks.splice(idx, 1);
};
 
const toggleTopUpRole = (role) => {
  const idx = permForm.value.topUpRoles.indexOf(role);
  if (idx === -1) permForm.value.topUpRoles.push(role);
  else permForm.value.topUpRoles.splice(idx, 1);
};

// Meal Allowance helpers
const addTimeWindow = () => {
  permForm.value.timeWindows.push({ start: '12:00', end: '13:00' });
};
const removeTimeWindow = (idx) => {
  permForm.value.timeWindows.splice(idx, 1);
};
const toggleActiveWeekDay = (day) => {
  const idx = permForm.value.activeWeekDays.indexOf(day);
  if (idx === -1) permForm.value.activeWeekDays.push(day);
  else permForm.value.activeWeekDays.splice(idx, 1);
};
 
const confirmDelete = () => {
  togglePermissionStatus(selectedPerm.value.id);
  isDeleteModalOpen.value = false;
};
 
</script>
 
<template>
  <div class="max-w-[1240px] mx-auto space-y-6 animate-in pb-12">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5 px-4">
      <div class="space-y-3">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">สิทธิ์สวัสดิการกลาง</h2>
        <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">การควบคุมสิทธิ์สวัสดิการระดับศูนย์กลางสำหรับสาขาในเครือ</p>
      </div>
      <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
        <Plus :size="20" stroke-width="3" /> สร้างสิทธิ์สวัสดิการใหม่
      </button>
    </div>
 
    <!-- Toolbar: Search, Filter -->
    <div class="flex flex-col md:flex-row gap-4 px-4">
      <div class="relative flex-1 group">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="20" />
        <input 
          v-model="searchTerm"
          placeholder="ค้นหาชื่อสิทธิ์ หรือ รหัสสิทธิ์..." 
          class="w-full pl-16 pr-8 py-4 bg-white border border-gray-100 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
        />
      </div>
      <div class="relative min-w-[240px]">
        <select 
          v-model="filterType"
          class="w-full pl-6 pr-12 py-4 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-600 appearance-none cursor-pointer outline-none shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
        >
          <option value="All">ทุกประเภทสิทธิ์</option>
          <option value="auto_reset">ประเภทรีเซ็ต</option>
          <option value="top_up">ประเภทสะสม</option>
          <option value="meal_allowance">ประเภทอาหาร</option>
        </select>
        <ChevronRight class="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" :size="16" stroke-width="3" />
      </div>
    </div>
 
    <!-- Permission Table Card -->
    <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100/50">
      <div v-if="filteredPerms.length > 0" class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-gray-50/30 border-b border-gray-50">
              <th class="w-20 py-4 px-6">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white"></div>
              </th>
              <th class="py-4 px-3 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">รายการสวัสดิการ</th>
              <th class="py-4 px-3 text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">ประเภท / รอบการรัน</th>
              <th class="py-4 px-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">มูลค่าตั้งต้น</th>
              <th class="py-4 px-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">สถานะกลาง</th>
              <th class="pr-10 pl-4 py-6 text-right text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50/50">
            <tr v-for="perm in filteredPerms" :key="perm.id" class="group hover:bg-gray-50/80 transition-all cursor-default relative">
              <td class="py-4 px-6">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white group-hover:border-blue-500 transition-all"></div>
              </td>
              <td class="py-4 px-3">
                <div class="flex items-center gap-5">
                  <div :class="perm.status === 'Active' ? 'bg-white shadow-xl shadow-blue-500/10 text-blue-600 border-blue-50' : 'bg-gray-50 text-gray-300 border-gray-100'" class="w-14 h-14 rounded-xl border flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3">
                      <component :is="getIconComponent(perm.icon)" :size="24" stroke-width="2.5" />
                  </div>
                  <div>
                      <p class="text-base font-medium text-gray-900 tracking-tight uppercase">{{ perm.name }}</p>
                      <p class="text-[10px] text-gray-300 font-medium uppercase tracking-widest mt-0.5">ID: {{ perm.id }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-3">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2.5 py-1 rounded-lg text-[9px] font-medium uppercase tracking-widest shadow-sm"
                      :class="getTypeBadgeClass(perm.type)"
                    >
                      {{ getTypeBadgeLabel(perm.type) }}
                    </span>
                    <span v-if="perm.type !== 'top_up'" class="text-xs font-medium text-gray-900 tracking-tight uppercase">{{ perm.frequency }}</span>
                  </div>
                  <p v-if="perm.frequency === 'Matrix' && perm.matrixDays?.length" class="text-[9px] text-gray-400 font-medium uppercase tracking-tight pl-0.5">
                    วัน: {{ perm.matrixDays.join(', ') }}
                  </p>
                  <p v-else-if="perm.type === 'auto_reset' && perm.frequency === 'Weekly' && perm.specificWeeks?.length" class="text-[9px] text-gray-400 font-medium uppercase tracking-tight pl-0.5">
                    สัปดาห์: {{ perm.specificWeeks.join(', ') }}
                  </p>
                  <p v-else-if="perm.type === 'auto_reset' && perm.frequency === 'Monthly'" class="text-[9px] text-gray-400 font-medium uppercase tracking-tight pl-0.5">
                    {{ perm.monthlyCycleType }} {{ perm.monthlySpecificDay ? `(${perm.monthlySpecificDay})` : '' }}
                  </p>
                  <p v-else-if="perm.type === 'meal_allowance' && perm.timeWindowsEnabled && perm.timeWindows?.length" class="text-[9px] text-gray-400 font-medium uppercase tracking-tight pl-0.5">
                    ช่วงเวลา: {{ perm.timeWindows.map(w => `${w.start}–${w.end}`).join(', ') }}
                  </p>
                  <p v-else-if="perm.type === 'meal_allowance'" class="text-[9px] text-gray-400 font-medium uppercase tracking-tight pl-0.5">
                    ใช้ได้ตลอดวัน
                  </p>
                </div>
              </td>
              <td class="py-4 px-3 text-center">
                <div v-if="perm.type !== 'top_up'" class="inline-flex flex-col items-center">
                    <span class="text-lg font-medium text-gray-900 tracking-tighter">
                      ฿{{ (perm.totalValue !== undefined ? perm.totalValue : perm.value || 0).toLocaleString() }}
                    </span>
                    <span class="text-[9px] font-medium text-gray-300 uppercase mt-0.5">
                      {{ perm.amountPerTime ? `จำกัด ฿${perm.amountPerTime}` : 'ไม่จำกัดต่อครั้ง' }}
                    </span>
                </div>
                <div v-else class="text-[10px] text-gray-300 font-medium uppercase tracking-widest">
                  ไม่กำหนดมูลค่าตั้งต้น
                </div>
              </td>
              <td class="py-4 px-3 text-center">
                <div 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-medium uppercase tracking-widest transition-all"
                  :class="perm.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-300'"
                >
                  <div class="w-2 h-2 rounded-full" :class="perm.status === 'Active' ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'"></div>
                  {{ perm.status === 'Active' ? 'เปิดใช้งาน' : 'ระงับการทำงาน' }}
                </div>
              </td>
              <td class="py-6 pr-10 text-right relative flex items-center justify-end gap-2">
                <button 
                  @click="activeMenuId = activeMenuId === perm.id ? null : perm.id"
                  class="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-all active:scale-90"
                >
                  <MoreHorizontal :size="20" stroke-width="3" />
                </button>
                
                <!-- Action Dropdown -->
                <div v-if="activeMenuId === perm.id" 
                  class="absolute right-14 top-1/2 -translate-y-1/2 w-[220px] bg-white rounded-xl shadow-2xl z-50 py-3 animate-in zoom-in-95 duration-200 border border-gray-100 shadow-blue-500/10"
                >
                  <button @click="openEditModal(perm)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-4 transition-colors">
                    <Edit :size="16" class="text-gray-400" />
                    <span class="text-sm font-medium text-gray-700 uppercase tracking-tight">แก้ไขโครงสร้างสิทธิ์</span>
                  </button>
                  <button @click="openUsageModal(perm)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-4 transition-colors">
                    <Building2 :size="16" class="text-gray-400" />
                    <span class="text-sm font-medium text-gray-700 uppercase tracking-tight">ดูการเชื่อมต่อสาขา</span>
                  </button>
                  <div class="h-px bg-gray-50 my-2 mx-3"></div>
                  <button @click="openDeleteModal(perm)" class="w-full px-5 py-3 text-left hover:bg-red-50 flex items-center gap-4 transition-colors group/item">
                    <Trash2 :size="16" class="text-red-400 group-hover:text-red-500" />
                    <span class="text-sm font-medium text-red-500 group-hover:text-red-600 uppercase tracking-tight">
                        {{ perm.status === 'Active' ? 'ระงับสิทธิ์' : 'เปิดการทำงาน' }}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- Empty State -->
      <div v-else class="py-16 flex flex-col items-center justify-center text-center space-y-5">
          <div class="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 border border-gray-100 group hover:rotate-6 transition-all">
              <Gift :size="48" stroke-width="1.5" />
          </div>
          <div class="space-y-2">
              <p class="text-2xl font-medium text-gray-900 tracking-tight uppercase">ไม่พบรายการสิทธิ์</p>
              <p class="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">ค้นหาด้วยรหัสหรือชื่ออื่น หรือสร้างสิทธิ์ใหม่เพื่อเริ่มการจัดการ</p>
          </div>
          <button @click="searchTerm = ''; filterType = 'All'" class="px-8 py-3 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200">Reset Filters</button>
      </div>
 
      <!-- Pagination Footer -->
      <div class="px-10 py-6 flex items-center justify-between border-t border-gray-50 bg-gray-50/10">
        <p class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">Total Items: {{ filteredPerms.length }}</p>
        <div class="flex items-center gap-3">
          <button class="w-10 h-10 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all active:scale-90"><ChevronLeft :size="18" stroke-width="3" /></button>
          <button class="w-10 h-10 rounded-xl bg-gray-900 text-white text-xs font-medium shadow-lg shadow-gray-200">1</button>
          <button class="w-10 h-10 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all active:scale-90"><ChevronRight :size="18" stroke-width="3" /></button>
        </div>
      </div>
    </div>
 
    <!-- Create/Edit Modal (Standardized for Layout) -->
    <Modal :is-open="isAddModalOpen || isEditModalOpen" @close="isAddModalOpen = isEditModalOpen = false" :title="isAddModalOpen ? 'สร้างสิทธิ์สวัสดิการใหม่' : 'แก้ไขโครงสร้างสิทธิ์'" size="5xl">
      <div class="space-y-6 pb-4 pt-1">
        <!-- Section 1: Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="space-y-2 md:col-span-1">
            <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">รหัสอ้างอิง</label>
            <div class="w-full px-5 py-4 bg-gray-100/50 border border-gray-100 rounded-xl text-sm font-medium text-gray-400 shadow-inner">
                {{ isAddModalOpen ? 'AUTOGEN' : permForm.id }}
            </div>
          </div>
          <div class="md:col-span-3 space-y-2">
            <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">ระบุชื่อสิทธิ์สวัสดิการ</label>
            <input 
              v-model="permForm.name" 
              placeholder="เช่น ค่าอาหารรายวัน, เบี้ยเลี้ยงเดินทาง..." 
              class="w-full px-5 py-4 bg-white border border-gray-200 rounded-xl text-base font-medium placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
 
        <!-- Section 2: Permission Type Selector -->
        <div class="space-y-4">
          <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">เลือกประเภทกลไกสิทธิ์</label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Auto Reset Card -->
            <div
              @click="permForm.type = 'auto_reset'"
              class="relative p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-4"
              :class="permForm.type === 'auto_reset' ? 'border-blue-600 bg-blue-50/10 shadow-xl shadow-blue-500/10' : 'border-gray-100 bg-white hover:border-gray-200'"
            >
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0" :class="permForm.type === 'auto_reset' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 shadow-inner border border-gray-100'">
                <RefreshCcw :size="26" stroke-width="2.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[15px] font-medium uppercase tracking-tight" :class="permForm.type === 'auto_reset' ? 'text-blue-600' : 'text-gray-900'">รีเซ็ตอัตโนมัติ</p>
                <p class="text-[10px] font-medium text-gray-400 uppercase leading-none mt-1">คืนโควตาใหม่ตามรอบ</p>
              </div>
              <div v-if="permForm.type === 'auto_reset'" class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 shrink-0">
                <Check :size="14" stroke-width="4" class="text-white" />
              </div>
            </div>

            <!-- Top Up Card -->
            <div
              @click="permForm.type = 'top_up'"
              class="relative p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-4"
              :class="permForm.type === 'top_up' ? 'border-blue-600 bg-blue-50/10 shadow-xl shadow-blue-500/10' : 'border-gray-100 bg-white hover:border-gray-200'"
            >
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0" :class="permForm.type === 'top_up' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 shadow-inner border border-gray-100'">
                <Wallet :size="26" stroke-width="2.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[15px] font-medium uppercase tracking-tight" :class="permForm.type === 'top_up' ? 'text-blue-600' : 'text-gray-900'">ระบบเติมเงิน</p>
                <p class="text-[10px] font-medium text-gray-400 uppercase leading-none mt-1">สะสมยอด ไม่มีการลบ</p>
              </div>
              <div v-if="permForm.type === 'top_up'" class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 shrink-0">
                <Check :size="14" stroke-width="4" class="text-white" />
              </div>
            </div>

            <!-- Meal Allowance Card -->
            <div
              @click="permForm.type = 'meal_allowance'; permForm.icon = 'Utensils'"
              class="relative p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-4"
              :class="permForm.type === 'meal_allowance' ? 'border-emerald-600 bg-emerald-50/10 shadow-xl shadow-emerald-500/10' : 'border-gray-100 bg-white hover:border-gray-200'"
            >
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0" :class="permForm.type === 'meal_allowance' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400 shadow-inner border border-gray-100'">
                <Utensils :size="26" stroke-width="2.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[15px] font-medium uppercase tracking-tight" :class="permForm.type === 'meal_allowance' ? 'text-emerald-600' : 'text-gray-900'">สิทธิ์อาหาร</p>
                <p class="text-[10px] font-medium text-gray-400 uppercase leading-none mt-1">ค่าอาหารตามรอบ + เวลา</p>
              </div>
              <div v-if="permForm.type === 'meal_allowance'" class="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 shrink-0">
                <Check :size="14" stroke-width="4" class="text-white" />
              </div>
            </div>
          </div>
        </div>
 
        <!-- Section 3: Logic Details (FIXED LAYOUT) -->
        <div class="p-6 rounded-3xl border border-gray-100 bg-white shadow-sm space-y-5 relative overflow-hidden">
          <div class="absolute left-0 top-0 w-2 h-full bg-blue-600 opacity-10"></div>
          
          <!-- Case: Auto Reset -->
          <template v-if="permForm.type === 'auto_reset'">
            <div class="space-y-4">
              <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">กำหนดความถี่การคืนสิทธิ์ (Reset Frequency)</label>
              <div class="relative group">
                <select 
                  v-model="permForm.frequency"
                  class="w-full pl-6 pr-12 py-4 bg-gray-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-xl text-sm font-medium text-gray-900 appearance-none cursor-pointer outline-none transition-all shadow-inner focus:bg-white"
                >
                  <option value="Daily">รายวัน (Daily)</option>
                  <option value="Weekly">รายสัปดาห์ (Weekly)</option>
                  <option value="Monthly">รายเดือน (Monthly)</option>
                </select>
                <ChevronRight class="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-270" :size="18" stroke-width="2.5" />
              </div>
            </div>
 
            <!-- Weekly Selection Grid (Dropdown) -->
            <div v-if="permForm.frequency === 'Weekly'" class="space-y-4 animate-in slide-in-from-top-2 pt-2">
                <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">เลือกสัปดาห์ที่เปิดสิทธิ์</label>
                <div class="relative w-full">
                  <MultiSelectDropdown 
                      v-model="permForm.specificWeeks"
                      :options="[
                        { value: 1, label: 'สัปดาห์ที่ 1' },
                        { value: 2, label: 'สัปดาห์ที่ 2' },
                        { value: 3, label: 'สัปดาห์ที่ 3' },
                        { value: 4, label: 'สัปดาห์ที่ 4' }
                      ]"
                      placeholder="เลือกสัปดาห์..."
                  />
                </div>
            </div>
 
            <!-- Monthly Sub-rules -->
            <div v-if="permForm.frequency === 'Monthly'" class="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6 animate-in slide-in-from-top-2">
               <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2">รูปแบบการรีเซ็ตรายเดือน</p>
               <div class="grid grid-cols-2 gap-2">
                    <button v-for="opt in [{id:'full_month', label:'ทั้งเดือน'}, {id:'first_day', label:'วันแรก'}, {id:'last_day', label:'วันสุดท้าย'}, {id:'specific_date', label:'ระบุวันที่'}]"
                        :key="opt.id" @click="permForm.monthlyCycleType = opt.id"
                        class="py-3 px-4 rounded-xl text-xs font-medium uppercase border-2 transition-all"
                        :class="permForm.monthlyCycleType === opt.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-300'">
                        {{ opt.label }}
                    </button>
               </div>
               <div v-if="permForm.monthlyCycleType === 'specific_date'" class="grid grid-cols-7 gap-1.5 pt-2">
                    <button v-for="i in 31" :key="i" @click="toggleMonthlyDate(i)"
                        class="aspect-square flex items-center justify-center text-[11px] font-medium rounded-xl border-2 transition-all active:scale-90"
                        :class="permForm.monthlyDates.includes(i) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'">
                        {{ i }}
                    </button>
               </div>
            </div>
 
            <!-- Matrix Days Grid -->
            <div v-if="permForm.frequency === 'Matrix'" class="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-4 animate-in slide-in-from-top-2">
                <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2">เลือกวันที่ระบุเฉพาะ (Matrix Days)</p>
                <div class="grid grid-cols-7 gap-1.5">
                    <button v-for="i in 31" :key="i" @click="toggleMatrixDay(i)"
                        class="aspect-square flex items-center justify-center text-[11px] font-medium rounded-xl border-2 transition-all active:scale-90"
                        :class="permForm.matrixDays.includes(i) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'">
                        {{ i }}
                    </button>
                </div>
            </div>
            
            <!-- LIMITS GRID (Refined for Layout) -->
            <div class="space-y-5 pt-2">
              <!-- DAILY SECTION -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Max Times per Day -->
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">จำนวนครั้งสูงสุด / วัน</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1">
                      <input type="number" v-model="permForm.timesPerDay" :disabled="permForm.timesPerDay === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click="permForm.timesPerDay = permForm.timesPerDay === null ? 3 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.timesPerDay === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>
                <!-- Max Amount Per Time (Daily) -->
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">วงเงินสูงสุดต่อครั้ง (รายวัน)</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1 group">
                      <input type="number" v-model="permForm.amountPerTimeDaily" :disabled="permForm.amountPerTimeDaily === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click.prevent="permForm.amountPerTimeDaily = permForm.amountPerTimeDaily === null ? 50 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.amountPerTimeDaily === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>
              </div>

              <!-- WEEKLY SECTION -->
              <div v-if="permForm.frequency === 'Weekly' || (permForm.frequency === 'Monthly' && permForm.monthlyCycleType === 'full_month')" class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in zoom-in-95">
                <!-- Max Times per Week -->
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">จำนวนครั้งสูงสุด / สัปดาห์ (รอบ)</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1">
                      <input type="number" v-model="permForm.timesPerCycle" :disabled="permForm.timesPerCycle === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click="permForm.timesPerCycle = permForm.timesPerCycle === null ? 1 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.timesPerCycle === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>
                <!-- Max Amount Per Time (Weekly) -->
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">วงเงินสูงสุดต่อครั้ง (รายสัปดาห์)</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1 group">
                      <input type="number" v-model="permForm.amountPerTimeWeekly" :disabled="permForm.amountPerTimeWeekly === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click.prevent="permForm.amountPerTimeWeekly = permForm.amountPerTimeWeekly === null ? 500 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.amountPerTimeWeekly === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>
              </div>

              <!-- MONTHLY SECTION -->
              <div v-if="permForm.frequency === 'Monthly' && permForm.monthlyCycleType === 'full_month'" class="animate-in fade-in zoom-in-95">
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ระบุจำนวนครั้งสูงสุด / เดือน (รอบ)</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1">
                      <!-- Using timesPerMonth as a mapping or reusing timesPerCycle for simplicity if that's how it's stored -->
                      <input type="number" v-model="permForm.timesPerMonth" :disabled="permForm.timesPerMonth === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click="permForm.timesPerMonth = permForm.timesPerMonth === null ? 10 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.timesPerMonth === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>
              </div>
 
              <!-- Total Value -->
              <div class="space-y-3">
                <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">วงเงินรวมสูงสุดต่อรอบการรัน</label>
                <div class="flex items-stretch gap-3">
                    <div class="relative flex-1">
                        <input type="number" v-model="permForm.totalValue" :disabled="permForm.totalValue === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 disabled:opacity-30 shadow-inner transition-all"
                        />
                    </div>
                    <button @click="permForm.totalValue = permForm.totalValue === null ? 150 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.totalValue === null ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                </div>
              </div>
            </div>
          </template>
 
          <!-- Case: Top Up -->
          <template v-if="permForm.type === 'top_up'">
            <div class="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div class="flex items-center gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-sm">
                <AlertCircle :size="24" class="text-blue-500" stroke-width="3" />
                <p class="text-xs font-medium text-blue-700 leading-relaxed uppercase tracking-tight">กลไกระบบเติมเงิน: เติมโควตาเข้ากระเป๋าพนักงานโดยตรง ไม่มีการตัดรอบหรือลบยอดคงเหลือ</p>
              </div>
              <div class="space-y-4">
                 <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-2">สิทธิ์การดำเนินการเติมเงิน</label>
                 <div class="grid grid-cols-2 gap-4">
                    <button @click="toggleTopUpRole('admin')"
                      class="p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all active:scale-95 group"
                      :class="permForm.topUpRoles.includes('admin') ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                        <Shield :size="24" stroke-width="2.5" />
                        <span class="text-[11px] font-medium uppercase tracking-widest">Admin Only</span>
                    </button>
                    <button @click="toggleTopUpRole('employee')"
                      class="p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all active:scale-95 group"
                      :class="permForm.topUpRoles.includes('employee') ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/10' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                        <Users :size="24" stroke-width="2.5" />
                        <span class="text-[11px] font-medium uppercase tracking-widest">Employee Self-TopUp</span>
                    </button>
                 </div>
              </div>
              
              <!-- Negative Balance Options (NEW) -->
              <div class="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 border-t border-gray-100 mt-6">
                <div @click="permForm.allowNegative = !permForm.allowNegative"
                  class="flex items-center justify-between p-6 bg-white rounded-3xl border-2 cursor-pointer transition-all hover:shadow-lg"
                  :class="permForm.allowNegative ? 'border-blue-600 bg-blue-50/5' : 'border-gray-100'">
                  <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner"
                      :class="permForm.allowNegative ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 border border-gray-100'">
                      <AlertCircle :size="24" stroke-width="2.5" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 uppercase tracking-tight">อนุญาตให้ใช้งานติดลบได้</p>
                      <p class="text-[10px] font-medium text-gray-400 uppercase mt-0.5">ยอมรับการทำรายการเมื่อยอดเงินในกระเป๋าไม่พอ</p>
                    </div>
                  </div>
                  <div class="w-12 h-7 rounded-full relative p-1 transition-colors" :class="permForm.allowNegative ? 'bg-blue-600' : 'bg-gray-200'">
                    <div class="h-5 w-5 bg-white rounded-full transition-all shadow-sm" :class="permForm.allowNegative ? 'translate-x-5' : 'translate-x-0'"></div>
                  </div>
                </div>

                <div v-if="permForm.allowNegative" class="space-y-3 animate-in slide-in-from-top-2">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">กำหนดวงเงินติดลบสูงสุด (฿)</label>
                  <input type="number" v-model="permForm.negativeLimit"
                    class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all"
                    placeholder="เช่น 1000..."
                  />
                </div>
              </div>
            </div>
          </template>
 
          <!-- Case: Meal Allowance -->
          <template v-if="permForm.type === 'meal_allowance'">
            <div class="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <!-- Info banner -->
              <div class="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 shadow-sm">
                <Utensils :size="24" class="text-emerald-600" stroke-width="2.5" />
                <p class="text-xs font-medium text-emerald-700 leading-relaxed uppercase tracking-tight">
                  สิทธิ์อาหารพนักงาน: ตั้งรอบการคืนโควตา + (เลือก) กำหนดช่วงเวลาที่ใช้ได้ในวัน + วงเงินต่อครั้ง/ต่อรอบ
                </p>
              </div>

              <!-- Frequency selector -->
              <div class="space-y-4">
                <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">รอบการให้สิทธิ์ (Reset Cycle)</label>
                <div class="relative group">
                  <select
                    v-model="permForm.frequency"
                    class="w-full pl-6 pr-12 py-4 bg-gray-50 hover:bg-white border border-transparent hover:border-emerald-100 rounded-xl text-sm font-medium text-gray-900 appearance-none cursor-pointer outline-none transition-all shadow-inner focus:bg-white"
                  >
                    <option value="Daily">ภายในวัน (Daily)</option>
                    <option value="Weekly">ภายในสัปดาห์ (Weekly)</option>
                    <option value="Monthly">ภายในเดือน (Monthly)</option>
                  </select>
                  <ChevronRight class="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" :size="18" stroke-width="2.5" />
                </div>
              </div>

              <!-- Weekly Selection (เหมือน auto_reset) -->
              <div v-if="permForm.frequency === 'Weekly'" class="space-y-4 animate-in slide-in-from-top-2 pt-2">
                <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-1">เลือกสัปดาห์ที่เปิดสิทธิ์</label>
                <div class="relative w-full">
                  <MultiSelectDropdown
                    v-model="permForm.specificWeeks"
                    :options="[
                      { value: 1, label: 'สัปดาห์ที่ 1' },
                      { value: 2, label: 'สัปดาห์ที่ 2' },
                      { value: 3, label: 'สัปดาห์ที่ 3' },
                      { value: 4, label: 'สัปดาห์ที่ 4' }
                    ]"
                    placeholder="เลือกสัปดาห์..."
                  />
                </div>
              </div>

              <!-- Monthly Sub-rules (เหมือน auto_reset) -->
              <div v-if="permForm.frequency === 'Monthly'" class="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-6 animate-in slide-in-from-top-2">
                <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2">รูปแบบการรีเซ็ตรายเดือน</p>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="opt in [{id:'full_month', label:'ทั้งเดือน'}, {id:'first_day', label:'วันแรก'}, {id:'last_day', label:'วันสุดท้าย'}, {id:'specific_date', label:'ระบุวันที่'}]"
                    :key="opt.id" @click="permForm.monthlyCycleType = opt.id"
                    class="py-3 px-4 rounded-xl text-xs font-medium uppercase border-2 transition-all"
                    :class="permForm.monthlyCycleType === opt.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-100 text-gray-300'">
                    {{ opt.label }}
                  </button>
                </div>
                <div v-if="permForm.monthlyCycleType === 'specific_date'" class="grid grid-cols-7 gap-1.5 pt-2">
                  <button v-for="i in 31" :key="i" @click="toggleMonthlyDate(i)"
                    class="aspect-square flex items-center justify-center text-[11px] font-medium rounded-xl border-2 transition-all active:scale-90"
                    :class="permForm.monthlyDates.includes(i) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'">
                    {{ i }}
                  </button>
                </div>
              </div>

              <!-- Time Windows Section -->
              <div class="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-5">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center" :class="permForm.timeWindowsEnabled ? 'text-emerald-600' : 'text-gray-300'">
                      <Clock :size="22" stroke-width="2.5" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 uppercase tracking-tight">ช่วงเวลาที่ใช้สิทธิ์ได้</p>
                      <p class="text-[10px] font-medium text-gray-400 uppercase mt-0.5">
                        {{ permForm.timeWindowsEnabled ? 'กำหนดเฉพาะช่วงเวลาที่อนุญาต' : 'ใช้ได้ตลอดวัน (ไม่จำกัดเวลา)' }}
                      </p>
                    </div>
                  </div>
                  <button @click="permForm.timeWindowsEnabled = !permForm.timeWindowsEnabled"
                    class="px-5 py-2.5 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                    :class="!permForm.timeWindowsEnabled ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                    ไม่จำกัด
                  </button>
                </div>

                <div v-if="permForm.timeWindowsEnabled" class="space-y-3 animate-in slide-in-from-top-2">
                  <div v-for="(win, idx) in permForm.timeWindows" :key="idx"
                    class="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div class="flex-1 grid grid-cols-2 gap-3">
                      <div class="space-y-1.5">
                        <label class="text-[9px] font-medium text-gray-400 uppercase tracking-widest ml-1">เริ่ม</label>
                        <input type="time" v-model="win.start"
                          class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-emerald-500 shadow-inner transition-all"
                        />
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[9px] font-medium text-gray-400 uppercase tracking-widest ml-1">สิ้นสุด</label>
                        <input type="time" v-model="win.end"
                          class="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-emerald-500 shadow-inner transition-all"
                        />
                      </div>
                    </div>
                    <button @click="removeTimeWindow(idx)"
                      class="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-5 active:scale-90 transition-all">
                      <X :size="16" stroke-width="3" />
                    </button>
                  </div>
                  <button @click="addTimeWindow"
                    class="w-full py-3 rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50/50 text-[11px] font-medium uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Plus :size="16" stroke-width="3" /> เพิ่มช่วงเวลา
                  </button>
                </div>
              </div>

              <!-- Limits Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Times per cycle -->
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">จำนวนครั้งสูงสุด / รอบ</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1">
                      <input type="number" v-model="permForm.timesPerCycle" :disabled="permForm.timesPerCycle === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-emerald-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click="permForm.timesPerCycle = permForm.timesPerCycle === null ? 2 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.timesPerCycle === null ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>

                <!-- Amount per time -->
                <div class="space-y-3">
                  <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">วงเงินสูงสุดต่อครั้ง (฿)</label>
                  <div class="flex items-stretch gap-3">
                    <div class="relative flex-1">
                      <input type="number" v-model="permForm.amountPerTime" :disabled="permForm.amountPerTime === null"
                        class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-emerald-500 disabled:opacity-30 shadow-inner transition-all"
                      />
                    </div>
                    <button @click="permForm.amountPerTime = permForm.amountPerTime === null ? 80 : null"
                      class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                      :class="permForm.amountPerTime === null ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                      ไม่จำกัด
                    </button>
                  </div>
                </div>
              </div>

              <!-- Total Value (full width) -->
              <div class="space-y-3">
                <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">วงเงินรวมสูงสุดต่อรอบ (฿)</label>
                <div class="flex items-stretch gap-3">
                  <div class="relative flex-1">
                    <input type="number" v-model="permForm.totalValue" :disabled="permForm.totalValue === null"
                      class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-lg font-medium text-gray-900 outline-none focus:bg-white focus:border-emerald-500 disabled:opacity-30 shadow-inner transition-all"
                    />
                  </div>
                  <button @click="permForm.totalValue = permForm.totalValue === null ? 160 : null"
                    class="px-6 rounded-xl border-2 text-[11px] font-medium uppercase tracking-widest transition-all shrink-0 whitespace-nowrap active:scale-95"
                    :class="permForm.totalValue === null ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                    ไม่จำกัด
                  </button>
                </div>
              </div>

              <!-- Working Days Section -->
              <div class="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-5">
                <div @click="permForm.workingDaysOnly = !permForm.workingDaysOnly"
                  class="flex items-center justify-between cursor-pointer">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center" :class="permForm.workingDaysOnly ? 'text-emerald-600' : 'text-gray-300'">
                      <Calendar :size="22" stroke-width="2.5" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 uppercase tracking-tight">เปิดเฉพาะวันทำงาน</p>
                      <p class="text-[10px] font-medium text-gray-400 uppercase mt-0.5">เลือกวันที่ระบบจะปลดล็อกสิทธิ์</p>
                    </div>
                  </div>
                  <div class="w-12 h-7 rounded-full relative p-1 transition-colors" :class="permForm.workingDaysOnly ? 'bg-emerald-600' : 'bg-gray-200'">
                    <div class="h-5 w-5 bg-white rounded-full transition-all shadow-sm" :class="permForm.workingDaysOnly ? 'translate-x-5' : 'translate-x-0'"></div>
                  </div>
                </div>

                <div v-if="permForm.workingDaysOnly" class="space-y-4 animate-in slide-in-from-top-2">
                  <div class="grid grid-cols-7 gap-2">
                    <button v-for="d in WEEK_DAYS" :key="d.id" @click="toggleActiveWeekDay(d.id)"
                      class="aspect-square flex items-center justify-center text-xs font-medium rounded-xl border-2 transition-all active:scale-90"
                      :class="permForm.activeWeekDays.includes(d.id) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200'">
                      {{ d.label }}
                    </button>
                  </div>
                  <div @click="permForm.excludePublicHolidays = !permForm.excludePublicHolidays"
                    class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 cursor-pointer hover:shadow-sm transition-all">
                    <div class="flex items-center gap-3">
                      <AlertCircle :size="18" :class="permForm.excludePublicHolidays ? 'text-emerald-600' : 'text-gray-300'" stroke-width="2.5" />
                      <span class="text-xs font-medium text-gray-700 uppercase tracking-tight">ไม่รวมวันหยุดราชการ</span>
                    </div>
                    <div class="w-10 h-6 rounded-full relative p-1 transition-colors" :class="permForm.excludePublicHolidays ? 'bg-emerald-600' : 'bg-gray-200'">
                      <div class="h-4 w-4 bg-white rounded-full transition-all shadow-sm" :class="permForm.excludePublicHolidays ? 'translate-x-4' : 'translate-x-0'"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </template>

          <!-- Rollover Switch -->
          <div v-if="permForm.type === 'auto_reset'" @click="permForm.allowRollover = !permForm.allowRollover"
            class="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all group mt-6 shadow-inner">
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 rounded-[22px] flex items-center justify-center transition-all bg-white border border-gray-100 shadow-sm" :class="permForm.allowRollover ? 'text-blue-600 scale-110 shadow-blue-500/10' : 'text-gray-300'">
                <RefreshCcw :size="24" :class="permForm.allowRollover ? 'rotate-180 duration-700' : ''" stroke-width="3" />
              </div>
              <div>
                <span class="text-sm font-medium text-gray-900 block uppercase tracking-tight">อนุญาตให้ทบยอด (Rollover)</span>
                <span class="text-[11px] font-medium text-gray-400 uppercase mt-0.5 opacity-80">นำโควตาคงเหลือไปเพิ่มในรอบถัดไป</span>
              </div>
            </div>
            <div class="w-14 h-8 rounded-full relative p-1 transition-colors duration-500" :class="permForm.allowRollover ? 'bg-blue-600' : 'bg-gray-200 shadow-inner'">
              <div class="h-6 w-6 bg-white rounded-full transition-all duration-500 shadow-lg" :class="permForm.allowRollover ? 'translate-x-6' : 'translate-x-0'"></div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-10 w-full px-10 py-6 bg-gray-50/50 border-t border-gray-100 rounded-b-[32px]">
          <button @click="isAddModalOpen = isEditModalOpen = false" class="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] px-4">ยกเลิก</button>
          <button @click="handleSave" class="px-10 py-4 bg-blue-600 hover:bg-black text-white rounded-2xl text-sm font-medium transition-all active:scale-95 shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em]">
            บันทึกข้อมูลสิทธิ์
          </button>
        </div>
      </template>
    </Modal>
 
    <!-- Standard Info Modal -->
    <Modal :is-open="isUsageModalOpen" @close="isUsageModalOpen = false" :title="`การเชื่อมต่อสาขา: ${selectedPerm?.name}`" size="md">
       <div class="py-8 space-y-6">
          <div v-if="getActiveBranches(selectedPerm?.id).length === 0" class="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 group">
             <Building2 :size="48" class="text-gray-200 mx-auto mb-4 group-hover:scale-110 transition-transform duration-500" stroke-width="1.5" />
             <p class="text-[15px] text-gray-400 font-medium uppercase tracking-widest">ยังไม่มีสถิติการใช้ในระดับสาขา</p>
          </div>
          <div v-else class="space-y-3">
             <div v-for="branch in getActiveBranches(selectedPerm?.id)" :key="branch.id" class="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                <div class="flex items-center gap-5">
                   <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-[18px] flex items-center justify-center shadow-inner border border-blue-100/50">
                      <Building2 :size="20" stroke-width="2.5" />
                   </div>
                   <div>
                      <p class="text-base font-medium text-gray-900 uppercase tracking-tight">{{ branch.name }}</p>
                      <p class="text-[10px] text-gray-400 uppercase font-medium tracking-[0.1em] mt-0.5">{{ branch.type }}</p>
                   </div>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full">
                    <CheckCircle :size="14" stroke-width="3" />
                    <span class="text-[9px] font-medium uppercase tracking-widest">Connected</span>
                </div>
             </div>
          </div>
       </div>
       <template #footer>
          <div class="w-full px-6 pb-6">
              <button @click="isUsageModalOpen = false" class="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-medium uppercase tracking-widest shadow-xl">รับทราบและปิดหน้าต่าง</button>
          </div>
       </template>
    </Modal>
 
    <!-- Delete/Status Confirmation Modal -->
    <Modal :is-open="isDeleteModalOpen" @close="isDeleteModalOpen = false" :title="selectedPerm?.status === 'Active' ? 'ระงับสถานะสิทธิ์กลาง' : 'เปิดการทำงานสิทธิ์'" size="md">
       <div class="py-8 text-center space-y-5 px-6">
          <div class="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border-4 transition-all duration-700 animate-in zoom-in-50"
            :class="selectedPerm?.status === 'Active' ? 'bg-orange-50 text-orange-400 border-orange-100 shadow-xl shadow-orange-500/10' : 'bg-green-50 text-green-500 border-green-100 shadow-xl shadow-green-500/10'">
             <AlertCircle :size="40" stroke-width="3" />
          </div>
          <div class="space-y-3 px-4">
             <h3 class="text-2xl font-medium text-gray-900 tracking-tighter uppercase leading-none">{{ selectedPerm?.status === 'Active' ? 'ยืนยันการระงับสิทธิ์?' : 'ยืนยันการเปิดใช้งาน?' }}</h3>
             <p class="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-wide">
                สาขาที่ใช้สวัสดิการสิทธิ์ <span class="text-gray-900 underline">"{{ selectedPerm?.name }}"</span> จะถูกเปลี่ยนสถานะในระบบข้อมูลพนักงานทุกสาขาทันที
             </p>
          </div>
       </div>
       <template #footer>
          <div class="grid grid-cols-2 gap-4 w-full px-8 pb-8">
              <button @click="isDeleteModalOpen = false" class="py-5 text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">ยกเลิกรายการ</button>
              <button @click="confirmDelete" :class="selectedPerm?.status === 'Active' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-green-600 shadow-green-600/20'" class="py-5 text-white rounded-2xl text-[11px] font-medium uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                ยืนยันดำเนินการ
              </button>
          </div>
       </template>
    </Modal>
  </div>
</template>
 
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
</style>
