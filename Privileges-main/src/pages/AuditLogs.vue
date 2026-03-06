<script setup>
import { ref, computed } from 'vue';
import { 
  Search, ChevronRight, Eye, Download, ShieldAlert, History, ArrowRight, Calendar as CalendarIcon, Filter, ChevronLeft
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import Pagination from '../components/ui/Pagination.vue';
import { useApp } from '../composables/useApp';
 
const { logs, showToast } = useApp();
 
const searchTerm = ref('');
const filterAction = ref('All');
const selectedLog = ref(null);
const isDetailModalOpen = ref(false);
 
// Pagination State
const currentPage = ref(1);
const pageSize = ref(10);
 
// Date filtering logic
const startDate = ref(null);
const endDate = ref(null);
 

const filteredLogs = computed(() => {
  if (!logs.value) return [];
  return logs.value.filter(log => {
    // Search filter
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.value.toLowerCase());

    // Action filter
    const matchesFilter = filterAction.value === 'All' || log.action.includes(filterAction.value);

    // Date filter
    let matchesDate = true;
    const logDate = new Date(log.timestamp);
    if (startDate.value && endDate.value) {
      matchesDate = logDate >= new Date(startDate.value) && logDate <= new Date(endDate.value);
    } else if (startDate.value) {
      matchesDate = logDate >= new Date(startDate.value);
    } else if (endDate.value) {
      matchesDate = logDate <= new Date(endDate.value);
    }

    return matchesSearch && matchesFilter && matchesDate;
  });
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLogs.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize.value));

const openDetail = (log) => {
  selectedLog.value = log;
  isDetailModalOpen.value = true;
};
 
const exportLogs = () => {
  const headers = ['วันที่', 'เวลา', 'ผู้ทำรายการ', 'กิจกรรม', 'รายละเอียด'];
  const rows = filteredLogs.value.map(log => {
    const [date, time] = log.timestamp.split(' ');
    return [
      date,
      time,
      log.admin, 
      log.action, 
      // Escape quotes in details
      `"${log.details.replace(/"/g, '""')}"`
    ];
  });
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Activity_Logs_${Date.now()}.csv`;
  link.click();
  showToast('ส่งออกเป็นรายงาน Excel เรียบร้อยแล้ว');
};
 
const categoryMap = {
    'All': 'ทุกหมวดหมู่',
    'Branch': 'กิจกรรมสาขา',
    'Master': 'จัดการสิทธิ์กลาง',
    'Group': 'กลุ่มพนักงาน',
    'Employee': 'ข้อมูลพนักงาน',
    'System': 'ระบบ'
};
 
const getStatusClass = (action) => {
    const a = action.toLowerCase();
    if (a.includes('delete') || a.includes('ลบ')) return 'bg-red-50 text-red-600';
    if (a.includes('create') || a.includes('เพิ่ม') || a.includes('สร้าง')) return 'bg-blue-50 text-blue-600';
    if (a.includes('update') || a.includes('แก้ไข') || a.includes('status')) return 'bg-amber-50 text-amber-600';
    if (a.includes('sync') || a.includes('import')) return 'bg-emerald-50 text-emerald-600';
    return 'bg-gray-50 text-gray-500';
};
</script>
 
<template>
  <div class="max-w-[1200px] mx-auto space-y-8 animate-in pb-20">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
      <div class="space-y-1.5">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">ประวัติการทำรายการ</h2>
        <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">บันทึกประวัติความโปร่งใสและการตรวจสอบกิจกรรมทั้งหมดของระบบ</p>
      </div>
      <button @click="exportLogs" class="bg-white px-6 py-4 rounded-xl border border-gray-100 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-gray-500 shadow-sm hover:text-green-600 hover:border-gray-200 transition-all active:scale-95">
          <Download :size="20" stroke-width="2.5" /> นำออก EXCEL
      </button>
    </div>
 
    <!-- Filters Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
      <div class="relative group">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="20" />
        <input 
          v-model="searchTerm"
          placeholder="ค้นหาชื่อแอดมิน หรือ รายละเอียด..." 
          class="w-full pl-16 pr-8 py-4 bg-white border border-gray-100 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
        />
      </div>
 
      <div class="relative flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-2 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/20 transition-all">
        <CalendarIcon class="text-gray-400 ml-4" :size="20" stroke-width="2.5" />
        <input 
          type="date"
          v-model="startDate"
          class="w-full py-4 text-[13px] font-medium text-gray-600 appearance-none cursor-pointer outline-none bg-transparent"
        />
        <span class="text-gray-300 font-medium">-</span>
        <input 
          type="date"
          v-model="endDate"
          class="w-full py-4 text-[13px] font-medium text-gray-600 appearance-none cursor-pointer outline-none bg-transparent"
        />
      </div>
 
      <div class="relative">
        <Filter class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" :size="20" stroke-width="2.5" />
        <select 
          v-model="filterAction"
          class="w-full pl-16 pr-12 py-4 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-600 appearance-none cursor-pointer outline-none shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
        >
          <option v-for="(label, key) in categoryMap" :key="key" :value="key">{{ label }}</option>
        </select>
        <ChevronRight class="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" :size="16" stroke-width="3" />
      </div>
    </div>
 
    <!-- Audit Table Card -->
    <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100/50">
      <div v-if="filteredLogs.length > 0" class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="w-16 py-5 px-6">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white"></div>
              </th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">วันเวลาที่บันทึกรายการ</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">ผู้รับผิดชอบรายการ</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">หมวดหมู่กิจกรรม</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">สรุปรายละเอียดการทำรายการ</th>
              <th class="pr-8 pl-4 py-5 text-right text-xs font-medium text-gray-400 uppercase tracking-widest">ดูข้อมูล</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="log in paginatedLogs" :key="log.id" class="group hover:bg-gray-50/50 transition-all cursor-default">
              <td class="py-5 px-6">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white group-hover:border-blue-500 transition-all"></div>
              </td>
              <td class="py-5 px-4">
                <span class="text-xs font-medium text-gray-400 group-hover:text-gray-900 transition-colors uppercase">{{ log.timestamp }}</span>
              </td>
              <td class="py-5 px-4">
                <span class="text-[15px] font-medium text-gray-900 tracking-tight">{{ log.admin }}</span>
              </td>
              <td class="py-5 px-4">
                 <div 
                  :class="getStatusClass(log.action)" 
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-tight"
                 >
                   <div class="w-1.5 h-1.5 rounded-full bg-current opacity-80"></div>
                   {{ log.action }}
                 </div>
              </td>
              <td class="py-5 px-4">
                  <p class="text-[15px] text-gray-700 font-medium line-clamp-1 max-w-[340px]">{{ log.details }}</p>
              </td>
              <td class="py-5 pr-8 text-right relative">
                 <button @click="openDetail(log)" class="w-9 h-9 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-300 hover:text-blue-600 transition-all active:scale-95">
                    <Eye :size="18" stroke-width="2.5" />
                 </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- Empty State -->
      <div v-else class="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div class="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 border border-gray-100 shadow-inner">
              <History :size="48" stroke-width="1.5" />
          </div>
          <div class="space-y-1.5 px-8">
              <p class="text-xl font-medium text-gray-900 tracking-tight">ไม่พบประวัติการทำรายการ</p>
              <p class="text-sm text-gray-400 font-medium">ระบุคำค้นหาหรือเลือกวันที่อื่นเพื่อดูข้อมูลประวัติย้อนหลังของระบบ</p>
          </div>
          <button @click="searchTerm = ''; filterAction = 'All'; startDate = null; endDate = null" class="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95">ล้างตัวกรองและวันที่</button>
      </div>
 
      <!-- Pagination Footer -->
      <Pagination 
        v-if="filteredLogs.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total-items="filteredLogs.length"
      />
    </div>
 
    <!-- Detail Modal (Standardized) -->
    <Modal :is-open="isDetailModalOpen" @close="isDetailModalOpen = false" title="รายละเอียดประวัติกิจกรรม" size="md">
      <div class="space-y-10 py-4 px-2">
          <div class="p-8 bg-gray-50 rounded-3xl space-y-6 relative overflow-hidden border border-gray-100">
              <div class="space-y-4 relative z-10 w-full break-words">
                  <div class="inline-flex px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-medium text-gray-400 uppercase tracking-wide shadow-sm">{{ selectedLog?.timestamp }}</div>
                  <h3 class="text-xl font-medium text-gray-900 tracking-tight leading-relaxed uppercase break-words">{{ selectedLog?.details }}</h3>
              </div>
          </div>
 
          <div class="grid grid-cols-2 gap-8 px-6">
              <div class="space-y-2">
                   <p class="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">ผู้ทำรายการ</p>
                   <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 transition-colors">
                      <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-blue-500/20">{{ selectedLog?.admin?.charAt(0) || '?' }}</div>
                      <p class="text-[15px] font-medium text-gray-900 truncate tracking-tight uppercase">{{ selectedLog?.admin }}</p>
                   </div>
              </div>
              <div class="space-y-2">
                   <p class="text-xs font-medium text-gray-400 uppercase tracking-widest ml-1">ประเภท</p>
                   <div class="flex items-center gap-3">
                       <span class="inline-flex px-5 py-3.5 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest shadow-lg shadow-gray-200">{{ selectedLog?.action }}</span>
                   </div>
              </div>
          </div>
          
          <div class="px-6 pb-2">
              <div class="p-6 bg-blue-50/20 border border-blue-100/50 rounded-xl flex flex-col gap-4">
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white text-blue-500 rounded-xl flex items-center justify-center shadow-md border border-blue-50">
                            <History :size="24" stroke-width="2.5" />
                        </div>
                        <div>
                            <p class="text-xs font-medium text-blue-600 uppercase tracking-widest">รหัสตรวจสอบรายการ</p>
                            <p class="text-[11px] font-medium text-blue-400">การยืนยันความถูกต้องระดับระบบ</p>
                        </div>
                    </div>
                    <code class="text-sm font-medium text-blue-700 bg-white px-4 py-2 rounded-xl border border-blue-50 shadow-sm transition-all hover:scale-110 cursor-alias">#{{ selectedLog?.id }}</code>
                  </div>
              </div>
          </div>
      </div>
      <template #footer>
          <div class="w-full px-6 pb-6">
              <button @click="isDetailModalOpen = false" class="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-medium uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                  รับทราบข้อมูล <ArrowRight :size="18" stroke-width="3" />
              </button>
          </div>
      </template>
    </Modal>
  </div>
</template>
