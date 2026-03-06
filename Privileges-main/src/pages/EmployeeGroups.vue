<script setup>
import { ref, computed } from 'vue';
import { 
  Users, Search, Plus, MoreHorizontal, Edit, Trash2, Shield, 
  ChevronRight, ChevronLeft, Filter, Download, Briefcase, Database, Gift
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import MemberSelectionModal from '../components/ui/MemberSelectionModal.vue';
import Pagination from '../components/ui/Pagination.vue';
import { useApp } from '../composables/useApp';
import { Check, Upload } from 'lucide-vue-next';
 
const { 
  branchGroups, permissions, branchEmployees, showToast, addLog,
  assignEmployeeToGroup, removeEmployeeFromGroup, managingBranch,
  getEnabledBranchPerms, addBranchGroup, updateBranchGroup
} = useApp();
 
const searchTerm = ref('');
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedGroup = ref(null);
 
const groupForm = ref({
  name: '',
  rules: []
});

// New state for Redesign
const viewMode = ref('list'); // 'list' or 'detail'
const activeTab = ref('permissions'); // 'permissions' or 'members'
const memberSearchTerm = ref('');
const isSelectionModalOpen = ref(false);
const selectedMemberIds = ref([]);

// Pagination State for Members Table
const currentPage = ref(1);
const pageSize = ref(10);

const toggleSelectAllMembers = () => {
  const currentMemberIds = getEmployeesInGroup(selectedGroup.value.id).map(e => e.id);
  if (selectedMemberIds.value.length === currentMemberIds.length) {
    selectedMemberIds.value = [];
  } else {
    selectedMemberIds.value = [...currentMemberIds];
  }
};

const enterDetailMode = (group) => {
  selectedGroup.value = group;
  viewMode.value = 'detail';
  activeTab.value = 'permissions';
  selectedMemberIds.value = [];
};

const backToList = () => {
  viewMode.value = 'list';
  selectedGroup.value = null;
  selectedMemberIds.value = [];
};

const handleBulkAddMembers = (employees) => {
  let count = 0;
  employees.forEach(emp => {
    const result = assignEmployeeToGroup(emp.id, selectedGroup.value.id);
    if (!result.conflict) count++;
  });
  
  if (count > 0) {
    showToast(`เพิ่มพนักงาน ${count} คนเข้ากลุ่ม "${selectedGroup.value.name}" เรียบร้อยแล้ว`);
    addLog('Group Update', `Added ${count} members to ${selectedGroup.value.name}`);
  }
  isSelectionModalOpen.value = false;
};

const handleRemoveMember = (empId) => {
  removeEmployeeFromGroup(empId, selectedGroup.value.id);
  showToast('ลบพนักงานออกจากกลุ่มเรียบร้อยแล้ว');
  addLog('Group Update', `Removed member from ${selectedGroup.value.name}`);
};
 
const filteredGroups = computed(() => {
  if (!branchGroups.value) return [];
  return branchGroups.value.filter(g => 
    g.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const branchPermissions = computed(() => {
  const activePermIds = getEnabledBranchPerms();
  return permissions.value.filter(p => activePermIds.includes(p.id));
});
 
const getPermissionName = (id) => {
  if (!permissions.value) return '...';
  const perm = permissions.value.find(p => p.id === id);
  return perm ? perm.name : 'ไม่ระบุ';
};
 
const getEmployeesInGroup = (groupId) => {
  return branchEmployees.value.filter(e => e.groups.includes(groupId));
};

const paginatedMembers = computed(() => {
    const members = getEmployeesInGroup(selectedGroup.value?.id || '');
    const start = (currentPage.value - 1) * pageSize.value;
    return members.slice(start, start + pageSize.value);
});

const totalMemberPages = computed(() => {
    const total = getEmployeesInGroup(selectedGroup.value?.id || '').length;
    return Math.ceil(total / pageSize.value);
});

const handleUpdateGroupName = () => {
  if (!selectedGroup.value) return;
  // In a real app, this would be an API call
  showToast('อัปเดตชื่อกลุ่มเรียบร้อยแล้ว');
  addLog('Group Update', `เปลี่ยนชื่อกลุ่มเป็น: ${selectedGroup.value.name}`);
};

const toggleGroupPermission = (permId) => {
  if (!selectedGroup.value) return;
  const index = selectedGroup.value.rules.findIndex(r => r.permId === permId);
  if (index === -1) {
    selectedGroup.value.rules.push({ permId, validFrom: '', validTo: '' });
  } else {
    selectedGroup.value.rules.splice(index, 1);
  }
  showToast('อัปเดตสิทธิ์การใช้งานกลุ่มแล้ว');
};

const toggleFormPermission = (permId) => {
  const index = groupForm.value.rules.findIndex(r => r.permId === permId);
  if (index === -1) {
    groupForm.value.rules.push({ permId, validFrom: '', validTo: '' });
  } else {
    groupForm.value.rules.splice(index, 1);
  }
};

const isFormPermSelected = (permId) => {
  return groupForm.value?.rules.some(r => r.permId === permId);
};

const isPermSelected = (permId) => {
  return selectedGroup.value?.rules.some(r => r.permId === permId);
};

const openAddModal = () => {
  groupForm.value = { id: `G${Date.now().toString().slice(-4)}`, name: '', rules: [] };
  isAddModalOpen.value = true;
};
 
const handleSave = () => {
    if (!groupForm.value.name.trim()) {
      showToast('กรุณาระบุชื่อกลุ่ม', 'error');
      return;
    }
    addBranchGroup(groupForm.value);
    isAddModalOpen.value = false;
};
 
const downloadTemplate = () => {
  const headers = "UPOS_ID,FULL_NAME";
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, headers], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Employee_Import_Template.csv`;
  link.click();
  showToast('ดาวน์โหลดไฟล์ Template เรียบร้อยแล้ว');
};
 
const triggerExcelImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';
  input.onchange = (e) => {
    if (e.target.files.length > 0) {
      showToast('กำลังนำเข้าข้อมูล...', 'info');
      setTimeout(() => {
        showToast('อัปโหลดรายชื่อพนักงานสำเร็จ! ข้อมูลถูกซิงค์แล้ว');
        addLog('Employee Group', `นำเข้ารายชื่อพนักงานในกลุ่ม ${selectedGroup.value?.name || groupForm.value.name}`);
      }, 1500);
    }
  };
  input.click();
};
</script>
 
<template>
  <div class="max-w-[1200px] mx-auto space-y-8 animate-in pb-20 px-4">
    <!-- LIST MODE -->
    <template v-if="viewMode === 'list'">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div class="space-y-1.5">
          <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">กลุ่มพนักงาน</h2>
          <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">จัดการสิทธิสวัสดิการแยกตามกลุ่มหรือแผนกของพนักงาน</p>
        </div>
        <div class="flex items-center gap-3">
        <button @click="openAddModal" class="bg-blue-600 hover:bg-black text-white px-8 py-4 rounded-xl font-medium uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <Plus :size="20" stroke-width="3" /> สร้างกลุ่มพนักงานใหม่
        </button>
      </div>
      </div>

      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-4 px-2">
        <div class="relative flex-1 group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="18" />
          <input 
            v-model="searchTerm"
            placeholder="ค้นหาชื่อกลุ่ม..." 
            class="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
          />
        </div>
      </div>

      <!-- Groups Grid -->
      <div v-if="filteredGroups.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
        <div v-for="group in filteredGroups" :key="group.id" 
             @click="enterDetailMode(group)"
             class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 cursor-pointer transition-all group relative overflow-hidden">
          
          <div class="absolute -right-10 -top-10 text-gray-50/50 group-hover:text-blue-50/50 transition-colors">
              <Database :size="160" />
          </div>

          <div class="relative z-10 space-y-6">
            <div class="flex items-center justify-between">
              <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50">
                <Users :size="28" stroke-width="2" />
              </div>
              <button @click.stop="enterDetailMode(group)" class="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-colors">
                  <Edit :size="18" />
              </button>
            </div>

            <div>
              <h3 class="text-xl font-medium text-gray-900 tracking-tight uppercase">{{ group.name }}</h3>
              <p class="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">ID: {{ group.id }} • {{ getEmployeesInGroup(group.id).length }} สมาชิก</p>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <div v-for="i in Math.min(3, getEmployeesInGroup(group.id).length)" :key="i" 
                  class="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                  {{ getEmployeesInGroup(group.id)[i-1].name.charAt(0) }}
                </div>
                <div v-if="getEmployeesInGroup(group.id).length > 3" class="w-7 h-7 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                  +{{ getEmployeesInGroup(group.id).length - 3 }}
                </div>
              </div>
              <span class="text-[11px] font-medium text-gray-400 uppercase tracking-widest ml-1">จัดการสมาชิก</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div class="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-200 border border-gray-100 shadow-inner">
              <Database :size="40" stroke-width="1.5" />
          </div>
          <div class="space-y-1.5">
              <p class="text-xl font-medium text-gray-900 tracking-tight">ไม่พบกลุ่มพนักงาน</p>
              <p class="text-sm text-gray-400 font-medium uppercase">ลองค้นหาด้วยชื่ออื่นหรือสร้างกลุ่มใหม่ในระบบ</p>
          </div>
          <button @click="searchTerm = ''" class="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95">ล้างคำค้นหา</button>
      </div>
    </template>

    <!-- DETAIL MODE (Manage Members) -->
    <template v-else-if="selectedGroup">
      <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <!-- Breadcrumb / Back -->
        <button @click="backToList" class="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors group">
          <div class="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
            <ChevronLeft :size="16" stroke-width="2.5" />
          </div>
          <span class="text-xs font-bold uppercase tracking-widest">ย้อนกลับไปรายการกลุ่ม</span>
        </button>



        <!-- Detail Container -->
        <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div class="flex border-b border-gray-100 px-8">
            <button @click="activeTab = 'permissions'" 
              class="px-10 py-6 text-sm font-medium uppercase tracking-widest transition-all relative"
              :class="activeTab === 'permissions' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'">
              กำหนดสิทธิ์
              <div v-if="activeTab === 'permissions'" class="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
            </button>
            <button @click="activeTab = 'members'" 
              class="px-10 py-6 text-sm font-medium uppercase tracking-widest transition-all relative"
              :class="activeTab === 'members' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'">
              จัดการสมาชิก
              <div v-if="activeTab === 'members'" class="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
            </button>
          </div>

          <div class="p-10 space-y-10">
            <!-- TAB: PERMISSIONS/SETTINGS -->
            <div v-if="activeTab === 'permissions'" class="space-y-10 animate-in fade-in duration-300">
               <!-- Group Info Edit -->
               <div class="space-y-6">
                  <h3 class="text-sm font-bold text-blue-600 uppercase tracking-widest">ข้อมูลทั่วไป</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                       <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">รหัสกลุ่ม (GROUP ID)</label>
                       <input :value="selectedGroup.id" disabled class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed" />
                    </div>
                    <div class="space-y-2">
                       <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ชื่อกลุ่มพนักงาน</label>
                       <div class="flex gap-2">
                        <input v-model="selectedGroup.name" class="flex-1 px-6 py-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:border-blue-500 outline-none transition-all" />
                        <button @click="handleUpdateGroupName" class="px-6 py-4 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">บันทึก</button>
                       </div>
                    </div>
                  </div>
               </div>

               <!-- Entitlements Selection -->
               <div class="space-y-6">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-bold text-blue-600 uppercase tracking-widest">กำหนดสิทธิ์สวัสดิการ</h3>
                    <span class="text-[11px] font-medium text-gray-400 uppercase">เลือกสิทธิ์ที่กลุ่มนี้จะได้รับ</span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div v-for="perm in branchPermissions" :key="perm.id"
                         @click="toggleGroupPermission(perm.id)"
                         class="relative p-6 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-5 group"
                         :class="isPermSelected(perm.id) ? 'bg-blue-50 border-blue-600 shadow-md transform -translate-y-1' : 'bg-white border-gray-100 hover:border-blue-200'">
                      
                      <div class="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                           :class="isPermSelected(perm.id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'">
                        <component :is="perm.icon === 'Coffee' ? Gift : (perm.icon === 'Wallet' ? Database : Briefcase)" :size="28" />
                      </div>
                      
                      <div class="flex-1">
                        <p class="text-sm font-bold leading-tight" :class="isPermSelected(perm.id) ? 'text-gray-900' : 'text-gray-500'">{{ perm.name }}</p>
                        <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{{ perm.type === 'auto_reset' ? 'รีเซ็ตอัตโนมัติ' : 'เติมเงิน' }}</p>
                      </div>

                      <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                           :class="isPermSelected(perm.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'">
                         <Check v-if="isPermSelected(perm.id)" :size="12" class="text-white" stroke-width="4" />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <!-- TAB: MEMBERS (Original Detail Content) -->
            <div v-if="activeTab === 'members'" class="space-y-10 animate-in fade-in duration-300">


               <div class="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-8">
                  <!-- Search Members -->
                  <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
                     <div class="relative flex-1 max-w-md w-full group">
                       <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="18" />
                       <input v-model="memberSearchTerm" placeholder="ค้นหาโดย รหัส / ชื่อ-นามสกุล / Card SN" 
                         class="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-xl text-sm font-medium shadow-sm focus:border-blue-500 outline-none transition-all" />
                     </div>
                     <div class="flex items-center gap-3">
                       <button @click="isSelectionModalOpen = true" class="px-8 py-4 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest">
                          เลือกรายชื่อ
                       </button>
                     </div>
                  </div>



                  <!-- Members Table -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between px-2">
                       <div class="flex items-center gap-2">
                         <span class="text-sm font-bold text-gray-900 uppercase tracking-widest">รายชื่อ</span>
                         <span class="bg-orange-100 text-orange-600 px-4 py-1 rounded-lg text-xs font-bold">{{ getEmployeesInGroup(selectedGroup.id).length }}</span>
                       </div>
                       <div class="flex items-center gap-3">
                          <select v-model="statusFilter" class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-600 outline-none">
                            <option value="all">สถานะ: ทั้งหมด</option>
                          </select>
                       </div>
                    </div>

                    <div class="overflow-x-auto rounded-3xl border border-gray-100 bg-white">
                       <table class="w-full text-left border-collapse">
                         <thead>
                           <tr class="bg-gray-50/50 border-b border-gray-100">
                             <th class="p-5 w-12">
                               <input type="checkbox" 
                                 :checked="selectedMemberIds.length > 0 && selectedMemberIds.length === getEmployeesInGroup(selectedGroup.id).length"
                                 @change="toggleSelectAllMembers"
                                 class="w-4 h-4 rounded-md border-gray-300 text-blue-600 cursor-pointer">
                             </th>
                             <th v-for="h in ['รหัสพนักงาน', 'ชื่อ-นามสกุล (TH)', 'Card SN', 'วันที่นำเข้า']" :key="h" 
                               class="p-5 text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">
                               {{ h }} <span class="text-gray-300 ml-1">↑↓</span>
                             </th>
                             <th class="p-5 w-16"></th>
                           </tr>
                         </thead>
                          <tbody class="divide-y divide-gray-50">
                            <tr v-for="emp in paginatedMembers" :key="emp.id" class="hover:bg-gray-50/30 transition-colors">
                             <td class="p-5">
                               <input type="checkbox" 
                                 v-model="selectedMemberIds" 
                                 :value="emp.id"
                                 class="w-4 h-4 rounded-md border-gray-300 text-blue-600 cursor-pointer">
                             </td>
                             <td class="p-5 text-sm font-medium text-gray-600">{{ emp.externalId }}</td>
                             <td class="p-5 text-sm font-bold text-gray-900">{{ emp.name }}</td>
                             <td class="p-5 text-sm text-gray-500 font-mono">{{ emp.card_sn || '-' }}</td>
                             <td class="p-5 text-sm text-gray-400 font-medium whitespace-nowrap">20/12/2024</td>
                             <td class="p-5">
                               <button @click="handleRemoveMember(emp.id)" class="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all">
                                  <Trash2 :size="16" />
                               </button>
                             </td>
                           </tr>
                         </tbody>
                       </table>
                    </div>
                    
                    <!-- Pagination Footer -->
                    <Pagination 
                        v-if="getEmployeesInGroup(selectedGroup.id).length > 0"
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :total-pages="totalMemberPages"
                        :total-items="getEmployeesInGroup(selectedGroup.id).length"
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal (Add Mode with Permissions) -->
    <Modal :is-open="isAddModalOpen" @close="isAddModalOpen = false" title="สร้างกลุ่มพนักงานใหม่" size="4xl">
        <div class="p-8 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <!-- Group Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">รหัสกลุ่ม (SYSTEM GEN)</label>
                    <input :value="groupForm.id" disabled class="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-400 cursor-not-allowed" />
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ชื่อกลุ่มพนักงาน</label>
                    <input v-model="groupForm.name" placeholder="ระบุชื่อกลุ่ม..." class="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-sm" />
                </div>
            </div>

            <!-- Permission Selection -->
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-bold text-blue-600 uppercase tracking-widest">เลือกสิทธิ์สวัสดิการเริ่มต้น</h3>
                    <span class="text-[11px] font-medium text-gray-400 uppercase">สิทธิ์ที่แสดงอ้างอิงจากการตั้งค่า Wallet</span>
                </div>
                
                <div v-if="branchPermissions.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="perm in branchPermissions" :key="perm.id"
                         @click="toggleFormPermission(perm.id)"
                         class="relative p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4"
                         :class="isFormPermSelected(perm.id) ? 'bg-blue-50 border-blue-600 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100'">
                      
                      <div class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                           :class="isFormPermSelected(perm.id) ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'">
                        <component :is="perm.icon === 'Coffee' ? Gift : (perm.icon === 'Wallet' ? Database : Briefcase)" :size="24" />
                      </div>
                      
                      <div class="flex-1">
                        <p class="text-sm font-bold leading-tight" :class="isFormPermSelected(perm.id) ? 'text-gray-900' : 'text-gray-500'">{{ perm.name }}</p>
                        <p class="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{{ perm.type === 'auto_reset' ? 'รีเซ็ตอัตโนมัติ' : 'เติมเงิน' }}</p>
                      </div>

                      <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                           :class="isFormPermSelected(perm.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'">
                         <Check v-if="isFormPermSelected(perm.id)" :size="10" class="text-white" stroke-width="4" />
                      </div>
                    </div>
                </div>
                <div v-else class="p-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">แอดมินสาขายังไม่ได้เปิดใช้งานสิทธิ์ใดๆ ในหน้าตั้งค่า Wallet</p>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button @click="isAddModalOpen = false" class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all">ยกเลิก</button>
                <button @click="handleSave" class="px-10 py-4 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Plus :size="18" stroke-width="3" /> สร้างกลุ่มพนักงาน
                </button>
            </div>
        </div>
    </Modal>

    <!-- NEW Selection Modal -->
    <MemberSelectionModal 
      :is-open="isSelectionModalOpen"
      :all-employees="branchEmployees"
      :already-in-group-ids="selectedGroup?.id ? getEmployeesInGroup(selectedGroup.id).map(e => e.id) : []"
      :branch-name="managingBranch?.name"
      :group-name="selectedGroup?.name"
      @close="isSelectionModalOpen = false"
      @confirm="handleBulkAddMembers"
    />
  </div>
</template>
