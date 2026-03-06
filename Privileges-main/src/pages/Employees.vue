<script setup>
import { ref, computed } from 'vue';
import { 
  Users, Search, Plus, MoreHorizontal, Edit, Trash2, Shield, 
  ChevronRight, ChevronLeft, Filter, Download, Briefcase, Database, Gift, Info, CheckCircle
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import { useApp } from '../composables/useApp';
import * as XLSX from 'xlsx';
import MultiSelectDropdown from '../components/ui/MultiSelectDropdown.vue';
 
const { branchEmployees, branchGroups, showToast } = useApp();
 
const searchTerm = ref('');
const filterGroup = ref('All');
const activeMenuId = ref(null);
 
// Modal states
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isImportModalOpen = ref(false);
const selectedEmp = ref(null);
 
const filteredEmployees = computed(() => {
  if (!branchEmployees.value) return [];
  return branchEmployees.value.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.value.toLowerCase()) || 
      emp.externalId.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesFilter = filterGroup.value === 'All' || emp.groups.includes(filterGroup.value);
    return matchesSearch && matchesFilter;
  });
});
 
const getGroupName = (id) => {
  if (!branchGroups.value) return '...';
  const group = branchGroups.value.find(g => g.id === id);
  return group ? group.name : 'ไม่ระบุกลุ่ม';
};
const empForm = ref({ externalId: '', name: '', position: '', groups: [] });
 
const openAddModal = () => {
  empForm.value = { externalId: '', name: '', position: '', groups: [] };
  isAddModalOpen.value = true;
};
 
const openEditModal = (emp) => {
  selectedEmp.value = emp;
  empForm.value = { ...emp, groups: [...emp.groups] };
  isEditModalOpen.value = true;
};
 
// Manual add removed as per request
const handleAction = (type, emp) => {
  activeMenuId.value = null;
  if (type === 'edit') {
    openEditModal(emp);
  } else if (type === 'toggle') {
     showToast(`เปลี่ยนสถานะของ ${emp.name} สำเร็จ`);
  }
};
 
const downloadTemplate = () => {
    // 1. Data for Guideline sheet
    const guidelineData = [
        ['คอลัมน์ (Column)', 'ความหมาย (Description)', 'ตัวอย่าง (Example)'],
        ['UPOS_ID', 'รหัสพนักงานในระดับสาขา (บังคับต้องใส่)', 'UPOS-001'],
        ['FULL_NAME', 'ชื่อ-นามสกุลพนักงาน (ใส่เพื่อตรวจสอบความถูกต้อง)', 'สมชาย ใจชื่น'],
        ['CARD_SN', 'เลขบัตรประจำตัว 10 หลัก (หากไม่มีให้ว่างไว้)', '1234567890'],
        ['GROUP_ID', 'รหัสกลุ่มที่ต้องการผูกสิทธิ์ (เช่น G001, G002)', 'G001'],
        ['', '', ''],
        ['หมายเหตุ:', 'กรุณาตรวจสอบรหัสกลุ่ม (Group ID) ให้ตรงกับระบบก่อนบันทึก', '']
    ];

    // 2. Data for Template sheet
    const templateData = [
        ['UPOS_ID', 'FULL_NAME', 'CARD_SN', 'GROUP_ID'],
        ['UPOS-001', 'John Doe', '1234567890', 'G001']
    ];

    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    const wsGuideline = XLSX.utils.aoa_to_sheet(guidelineData);
    const wsTemplate = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths for guideline
    wsGuideline['!cols'] = [
        { wch: 20 },
        { wch: 50 },
        { wch: 20 }
    ];

    // Append sheets to workbook
    XLSX.utils.book_append_sheet(wb, wsGuideline, "Guideline");
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Employee_Import_Template");

    // Generate Excel file and download
    XLSX.writeFile(wb, "Employee_Import_Template.xlsx");
};
</script>
 
<template>
  <div class="max-w-[1200px] mx-auto space-y-8 animate-in pb-20">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
      <div class="space-y-1.5">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">รายชื่อพนักงาน</h2>
        <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">จัดการข้อมูลพนักงานและการมอบหมายสิทธิสวัสดิการระดับบุคคล</p>
      </div>
      <div class="flex gap-3">
          <button @click="isImportModalOpen = true" class="bg-blue-600 hover:bg-black text-white px-8 py-4 rounded-[16px] font-medium uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
              <Download :size="20" stroke-width="3" /> นำเข้ารายชื่อ (Excel)
          </button>
      </div>
    </div>
 
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-4 px-2">
      <div class="relative flex-1 group">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="20" />
        <input 
          v-model="searchTerm"
          placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..." 
          class="w-full pl-16 pr-8 py-4 bg-white border border-gray-100 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
        />
      </div>
      <div class="flex gap-3">
        <div class="relative min-w-[240px]">
          <select 
            v-model="filterGroup"
            class="w-full pl-6 pr-12 py-4 bg-white border border-gray-100 rounded-[22px] text-sm font-medium text-gray-600 appearance-none cursor-pointer outline-none shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            <option value="All">ทุกกลุ่มพนักงาน</option>
            <option v-for="g in branchGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
          <ChevronRight class="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" :size="16" stroke-width="3" />
        </div>
      </div>
    </div>
 
    <!-- Employees Table Table -->
    <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-50">
      <div v-if="filteredEmployees.length > 0" class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="w-16 py-5 px-6">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white"></div>
              </th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">พนักงาน / ข้อมูลพื้นฐาน</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest text-center">รหัสพนักงาน</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">กลุ่ม / สวัสดิการ</th>
              <th class="py-5 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-widest">สถานะ</th>
              <th class="pr-8 pl-4 py-5 text-right text-xs font-medium text-gray-400 uppercase tracking-widest">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="emp in filteredEmployees" :key="emp.id" class="group hover:bg-gray-50/50 transition-all cursor-default">
              <td class="py-5 px-6">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white group-hover:border-blue-500 transition-all"></div>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-medium border border-blue-100 transition-all group-hover:scale-110">
                      {{ emp.name?.charAt(0) || '?' }}
                  </div>
                  <div>
                      <p class="text-[15px] font-medium text-gray-900 tracking-tight">{{ emp.name }}</p>
                      <p class="text-[11px] text-gray-400 font-medium mt-0.5">{{ emp.position || 'ระบุตำแหน่งแล้ว' }}</p>
                  </div>
                </div>
              </td>
              <td class="py-5 px-4 text-center">
                <span class="text-sm font-medium text-gray-500 uppercase">{{ emp.externalId }}</span>
              </td>
              <td class="py-5 px-4">
                 <div class="flex flex-wrap gap-1.5">
                    <span v-for="gid in emp.groups" :key="gid" class="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-colors group-hover:bg-white group-hover:border-blue-100">
                        {{ getGroupName(gid) }}
                    </span>
                 </div>
              </td>
              <td class="py-5 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
                  <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  พร้อมใช้งาน
                </div>
              </td>
              <td class="py-5 pr-8 text-right relative">
                <div class="flex items-center justify-end">
                    <button class="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors focus:outline-none"
                            @click="activeMenuId = activeMenuId === emp.id ? null : emp.id">
                        <MoreHorizontal :size="20" stroke-width="2.5" />
                    </button>
                    <!-- Dropdown Menu -->
                    <div v-if="activeMenuId === emp.id" class="absolute right-10 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <button @click="handleAction('edit', emp)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
                        <Edit :size="16" class="text-gray-400" />
                        <span class="text-sm font-medium text-gray-700 uppercase tracking-tight">แก้ไขข้อมูล</span>
                      </button>
                      <button @click="handleAction('toggle', emp)" class="w-full px-5 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors group/del">
                        <Trash2 :size="16" class="text-red-400 group-hover:text-red-600" />
                        <span class="text-sm font-medium text-red-500 group-hover:text-red-600 uppercase tracking-tight">ระงับการทำงาน</span>
                      </button>
                    </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- Empty State -->
      <div v-else class="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div class="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 border border-gray-100">
              <Users :size="40" stroke-width="1.5" />
          </div>
          <div class="space-y-1.5 px-8">
              <p class="text-xl font-medium text-gray-900 tracking-tight">ไม่พบรายชื่อพนักงาน</p>
              <p class="text-sm text-gray-400 font-medium leading-relaxed">ค้นหาด้วยชื่อหรือรหัสอื่น หรือดำเนินการเพิ่มข้อมูลพนักงานเข้าสู่ฐานข้อมูลระบบ</p>
          </div>
          <button @click="searchTerm = ''; filterGroup = 'All'" class="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95">ล้างคำค้นหา</button>
      </div>
 
      <!-- Pagination Footer -->
      <div class="px-8 py-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/20">
        <p class="text-xs font-medium text-gray-400">แสดงผล {{ filteredEmployees.length }} จาก {{ branchEmployees?.length || 0 }} รายการ</p>
        <div class="flex items-center gap-2">
          <button class="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><ChevronLeft :size="16" stroke-width="3" /></button>
          <button class="w-8 h-8 rounded-lg bg-gray-900 text-white text-xs font-medium shadow-sm">1</button>
          <button class="w-8 h-8 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><ChevronRight :size="16" stroke-width="3" /></button>
        </div>
      </div>
    </div>
 
    <!-- Add/Edit Employee Modal -->
    <Modal :is-open="isAddModalOpen || isEditModalOpen" @close="isAddModalOpen = isEditModalOpen = false" :title="isAddModalOpen ? 'เพิ่มรายชื่อพนักงาน' : 'แก้ไขประวัติพนักงาน'" size="2xl">
        <div class="space-y-8 py-6 px-4">
             <div class="space-y-6">
                <div class="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl" v-if="isEditModalOpen">
                    <div class="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-50 flex items-center justify-center text-gray-400"><Info :size="18" stroke-width="2.5" /></div>
                    <div class="flex-1">
                        <p class="text-[11px] font-medium text-gray-500 uppercase tracking-widest">การเชื่อมต่อ API</p>
                        <p class="text-[11px] font-medium text-gray-400">ข้อมูลพื้นฐานพนักงานถูกดึงตรงจากระบบ UPOS ไม่สามารถแก้ไขส่วนนี้ได้</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <label class="text-[11px] font-medium text-gray-400 uppercase tracking-widest ml-1">รหัสอ้างอิง (UPOS ID)</label>
                        <input :disabled="isEditModalOpen" v-model="empForm.externalId" placeholder="เช่น UPOS-1234" class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    <div class="space-y-3">
                        <label class="text-[11px] font-medium text-gray-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุลพนักงาน</label>
                        <input :disabled="isEditModalOpen" v-model="empForm.name" placeholder="ระบุชื่อพนักงาน" class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                </div>
                
                <div class="h-px w-full bg-gray-50"></div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ตำแหน่ง (ดึงจาก UPOS)</label>
                        <input v-model="empForm.position" placeholder="ระบุตำแหน่ง" class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all" />
                    </div>
                    <div class="space-y-3">
                        <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">สังกัดกลุ่มพนักงาน</label>
                        <div class="relative w-full">
                           <MultiSelectDropdown 
                              v-model="empForm.groups"
                              :options="branchGroups.map(g => ({ value: g.id, label: g.name }))"
                              placeholder="เลือกกลุ่มพนักงาน"
                           />
                        </div>
                    </div>
                </div>
             </div>
        </div>
        <template #footer>
            <div class="flex items-center justify-end gap-10 w-full px-10 py-6 bg-gray-50/50 border-t border-gray-100 rounded-b-3xl">
               <button @click="isAddModalOpen = isEditModalOpen = false" class="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] px-4">ยกเลิก</button>
               <button @click="isAddModalOpen = isEditModalOpen = false" class="px-10 py-4 bg-blue-600 hover:bg-black text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em]">
                  บันทึกข้อมูลสิทธิ์พนักงาน
               </button>
            </div>
        </template>
    </Modal>
 
    <!-- Import EXCEL Modal -->
    <Modal :is-open="isImportModalOpen" @close="isImportModalOpen = false" title="นำเข้าข้อมูลจาก Excel" size="md">
        <div class="p-8 text-center space-y-8">
            <div class="w-24 h-24 bg-green-50 rounded-3xl mx-auto flex items-center justify-center text-green-600 shadow-inner border border-green-100">
                <Download :size="48" stroke-width="2.5" />
            </div>
            <div class="space-y-2">
                <h3 class="text-2xl font-medium text-gray-900 tracking-tight uppercase">โครงสร้างไฟล์นำเข้าระบบ</h3>
                <p class="text-xs font-medium text-gray-400 leading-relaxed max-w-sm mx-auto mb-2">อัปโหลดไฟล์ (.xlsx, .csv) จากระบบ UPOS เพื่อซิงค์พนักงานและอัปเดตกลุ่มสิทธิ์คราวละมากๆ</p>
                <button @click.prevent="downloadTemplate" class="text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4">
                    ดาวน์โหลดไฟล์ต้นฉบับ (Template)
                </button>
            </div>
            
            <!-- Drag and Drop Zone -->
            <div class="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-3xl p-10 flex flex-col items-center justify-center transition-all hover:bg-blue-50 hover:border-blue-400 cursor-pointer group">
                <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <Download :size="28" stroke-width="2.5" />
                </div>
                <p class="text-sm font-medium text-gray-600">ลากและวางไฟล์ตรงนี้ หรือ <span class="text-blue-600 font-semibold focus:underline">เลือกไฟล์</span> จากเครื่องของคุณ</p>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest mt-2">รองรับไฟล์ CSV, XLSX สูงสุด 1,000 รายการต่อครั้ง</p>
            </div>


            <div class="px-8 pb-8">
               <button @click="isImportModalOpen = false" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <CheckCircle :size="18" /> อัปโหลดไฟล์เข้าสู่ระบบ
               </button>
            </div>
        </div>
    </Modal>
  </div>
</template>
