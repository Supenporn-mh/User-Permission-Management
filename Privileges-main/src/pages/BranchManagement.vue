<script setup>
import { ref, computed } from 'vue';
import { 
  Search, Filter, MoreHorizontal, Edit, Shield, LayoutGrid, ChevronRight, ChevronLeft, Building2, Ticket, Gift, Trash2, RefreshCcw, AlertCircle, Plus, CheckCircle, Check, Wallet, Briefcase, Info, Coffee, Car
} from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import Modal from '../components/ui/Modal.vue';
import MultiSelectDropdown from '../components/ui/MultiSelectDropdown.vue';
import Pagination from '../components/ui/Pagination.vue';
import { useApp } from '../composables/useApp';
 
const router = useRouter();
const { 
  branches, permissions, setManagingBranch, showToast,
  addBranch, updateBranch, deleteBranch, toggleBranchStatus, syncBranchPermissions
} = useApp();
 
const searchTerm = ref('');
const filterTypes = ref([]);
const activeMenuId = ref(null);
 
const BRANCH_TYPES = ['โรงเรียน', 'โรงงาน', 'โรงพยาบาล'];
 
// Modal states
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedBranch = ref(null);
 
// Pagination State
const currentPage = ref(1);
const pageSize = ref(10);
 
// Form state
const branchForm = ref({
  id: '',
  name: '',
  type: 'โรงเรียน',
  permissions: []
});
 
const filteredBranches = computed(() => {
  if (!branches.value) return [];
  return branches.value.filter(b => 
    b.name.toLowerCase().includes(searchTerm.value.toLowerCase()) && 
    (filterTypes.value.length === 0 || filterTypes.value.length === BRANCH_TYPES.length || filterTypes.value.includes(b.type))
  );
});

const paginatedBranches = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredBranches.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() => Math.ceil(filteredBranches.value.length / pageSize.value));
 
const getBenefitIcon = (name) => {
  if (!name) return Gift;
  if (name.includes('อาหาร')) return Coffee;
  if (name.includes('กระเป๋า')) return Wallet;
  if (name.includes('เดินทาง')) return Car;
  return Gift;
};
 
const getPermissionName = (id) => {
  if (!permissions.value) return '...';
  const perm = permissions.value.find(p => p.id === id);
  return perm ? perm.name : 'ไม่ทราบชื่อ';
};
 
// Actions
const openAddModal = () => {
  showToast("กำลังดึงข้อมูลสาขาล่าสุดจากระบบ...", "info");
  // Logic for syncing or refreshing would go here
};
 
const openEditModal = (branch) => {
  selectedBranch.value = branch;
  branchForm.value = { ...branch, permissions: [...(branch.permissions || [])] };
  isEditModalOpen.value = true;
  activeMenuId.value = null;
};
 
const openDeleteModal = (branch) => {
  selectedBranch.value = branch;
  isDeleteModalOpen.value = true;
  activeMenuId.value = null;
};
 
const handleSaveBranch = () => {
  if (selectedBranch.value) {
    updateBranch(selectedBranch.value.id, branchForm.value);
    showToast(`แก้ไขข้อมูลสาขา ${branchForm.value.name} สำเร็จ`);
  }
  isEditModalOpen.value = false;
};
 
const confirmDelete = () => {
  if (selectedBranch.value) {
    toggleBranchStatus(selectedBranch.value.id);
    isDeleteModalOpen.value = false;
  }
};
 
const handleAction = (type, branch) => {
  if (type === 'manage') {
    setManagingBranch(branch); // Set the active branch
    router.push('/wallet-config');
  }
  activeMenuId.value = null;
};

const togglePermission = (id) => {
  const index = branchForm.value.permissions.indexOf(id);
  if (index === -1) branchForm.value.permissions.push(id);
  else branchForm.value.permissions.splice(index, 1);
};
</script>
 
<template>
  <div class="max-w-[1200px] mx-auto space-y-8 animate-in pb-20 px-4">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
      <div class="space-y-1.5">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">การจัดการสาขา</h2>
        <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">กำหนดเงื่อนไขและจัดการสวัสดิการพนักงานในระดับสาขา</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
          <RefreshCcw :size="20" stroke-width="3" /> ดึงข้อมูลล่าสุด
        </button>
      </div>
    </div>
 
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-4 px-2">
      <div class="relative flex-1 group">
        <Search class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="18" />
        <input 
          v-model="searchTerm"
          placeholder="ค้นหาชื่อสาขา..." 
          class="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
        />
      </div>
      <div class="relative min-w-[280px]">
        <MultiSelectDropdown 
            v-model="filterTypes"
            :options="BRANCH_TYPES"
            placeholder="ทุกประเภทสาขา"
        />
      </div>
    </div>
 
    <!-- Table Card -->
    <div class="bg-white rounded-3xl shadow-sm border border-gray-100/50">
      <div v-if="filteredBranches.length > 0" class="overflow-visible">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50/30 border-b border-gray-50">
              <th class="w-20 py-6 px-8 text-left">
                <div class="w-4 h-4 rounded border border-gray-200 bg-white"></div>
              </th>
              <th class="py-6 px-4 text-left text-[10px] font-medium text-gray-400 uppercase tracking-widest">ชื่อสาขา</th>
              <th class="py-6 px-4 text-left text-[10px] font-medium text-gray-400 uppercase tracking-widest">ประเภท</th>
              <th class="py-6 px-4 text-left text-[10px] font-medium text-gray-400 uppercase tracking-widest">สถานะ</th>
              <th class="py-6 px-4 text-left text-[10px] font-medium text-gray-400 uppercase tracking-widest">สิทธิสวัสดิการ</th>
              <th class="py-6 pr-10 text-right text-[10px] font-medium text-gray-400 uppercase tracking-widest">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50/50">
            <tr v-for="branch in paginatedBranches" :key="branch.id" class="group hover:bg-gray-50/80 transition-all cursor-default">
              <td class="py-6 px-8">
                 <div class="w-4 h-4 rounded border border-gray-200 bg-white group-hover:border-blue-500 transition-all"></div>
              </td>
              <td class="py-6 px-4">
                <div class="text-[15px] font-medium text-gray-900 uppercase tracking-tight">{{ branch.name }}</div>
              </td>
              <td class="py-6 px-4">
                <span class="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg uppercase tracking-widest">{{ branch.type }}</span>
              </td>
              <td class="py-6 px-4">
                <div 
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-widest transition-all"
                  :class="branch.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-300'"
                >
                  <div class="w-1.5 h-1.5 rounded-full" :class="branch.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'"></div>
                  {{ branch.status === 'Active' ? 'เปิดใช้งาน' : 'ระงับการทำงาน' }}
                </div>
              </td>
              <td class="py-6 px-4">
                <div class="flex flex-wrap gap-2">
                  <div v-for="benefitId in (branch.permissions || [])" :key="benefitId" 
                       class="flex items-center gap-2 px-2.5 py-1 bg-blue-50/50 border border-blue-100 rounded-lg text-[10px] font-medium text-blue-600 uppercase tracking-tight shadow-sm transition-all hover:bg-white">
                    <component :is="getBenefitIcon(getPermissionName(benefitId))" :size="12" stroke-width="2.5" />
                    <span>{{ getPermissionName(benefitId) }}</span>
                  </div>
                </div>
              </td>
              <td class="py-6 pr-10 text-right relative flex items-center justify-end gap-2">
                <button 
                  @click="activeMenuId = activeMenuId === branch.id ? null : branch.id"
                  class="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-all active:scale-90"
                >
                  <MoreHorizontal :size="18" stroke-width="3" />
                </button>
 
                <!-- Actions Dropdown -->
                <div v-if="activeMenuId === branch.id" 
                     class="absolute right-14 top-1/2 -translate-y-1/2 w-[220px] bg-white rounded-xl shadow-2xl z-50 py-3 border border-gray-100 animate-in zoom-in-95 duration-200"
                >
                  <button @click="handleAction('manage', branch)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-4 transition-colors">
                    <Building2 :size="16" class="text-gray-400" />
                    <span class="text-sm font-medium text-gray-700 uppercase tracking-tight">จัดการข้อมูลภายใน</span>
                  </button>
                  <button @click="openEditModal(branch)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-4 transition-colors">
                    <Edit :size="16" class="text-gray-400" />
                    <span class="text-sm font-medium text-gray-700 uppercase tracking-tight">แก้ไขสิทธิสวัสดิการ</span>
                  </button>
                  <button @click="openDeleteModal(branch)" class="w-full px-5 py-3 text-left hover:bg-red-50 flex items-center gap-4 transition-colors group/del">
                    <Trash2 :size="16" class="text-red-400 group-hover:text-red-600" />
                    <span class="text-sm font-medium text-red-500 group-hover:text-red-600 uppercase tracking-tight">{{ branch.status === 'Active' ? 'ระงับการทำงาน' : 'เปิดการทำงาน' }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <div v-else class="py-32 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div class="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 border border-gray-100 shadow-inner">
              <Building2 :size="48" stroke-width="1.5" />
          </div>
          <div class="space-y-2 px-10">
              <p class="text-2xl font-medium text-gray-900 tracking-tight uppercase">ไม่พบพิกัดสาขา</p>
              <p class="text-sm text-gray-400 font-medium uppercase tracking-widest leading-relaxed">ค้นหาด้วยชื่ออื่นหรือดำเนินการเพิ่มสาขาใหม่เข้าสู่เครือข่ายโครงการ</p>
          </div>
          <button @click="searchTerm = ''; filterType = 'All'" class="px-8 py-3 bg-gray-900 text-white rounded-xl text-xs font-medium uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200">Reset Filters</button>
      </div>
 
      <!-- Pagination Footer -->
      <Pagination 
        v-if="filteredBranches.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-pages="totalPages"
        :total-items="filteredBranches.length"
      />
    </div>
 
    <!-- Edit Modal (Refined Size) -->
    <Modal :is-open="isEditModalOpen" @close="isEditModalOpen = false" title="แก้ไขโครงสร้างสิทธิสาขา" size="2xl">
      <div class="space-y-10 py-4 px-2">
        <div class="space-y-5">
            <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-2">ข้อมูลพิกัดหลัก</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                  <p class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ชื่อสาขาที่ปรากฏ</p>
                  <input v-model="branchForm.name" placeholder="ระบุชื่อสาขา..." class="w-full px-5 py-4 bg-gray-50 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 border border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none shadow-inner" />
              </div>
              <div class="space-y-2">
                  <p class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ประเภทสถานประกอบการ</p>
                  <div class="grid grid-cols-3 gap-2">
                      <button v-for="type in BRANCH_TYPES" :key="type" @click="branchForm.type = type"
                        class="py-3 rounded-xl border-2 text-[10px] font-medium uppercase tracking-widest transition-all active:scale-95"
                        :class="branchForm.type === type ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-blue-100'">
                          {{ type }}
                      </button>
                  </div>
              </div>
            </div>
        </div>
 
        <div class="space-y-5 pt-4">
            <label class="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em] ml-2">มอบสิทธิสวัสดิการให้สาขานี้</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar p-1">
                <button 
                  v-for="perm in permissions" 
                  :key="perm.id"
                  @click="togglePermission(perm.id)"
                  class="w-full p-5 rounded-2xl bg-white border-2 flex items-center justify-between transition-all group active:scale-[0.98]"
                  :class="branchForm.permissions.includes(perm.id) ? 'border-blue-600 bg-blue-50/5 shadow-xl shadow-blue-500/5' : 'border-gray-50 hover:border-blue-100'"
                >
                    <div class="flex items-center gap-5 text-left">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-gray-50 text-gray-300 group-hover:text-blue-600 group-hover:bg-white shadow-inner border border-gray-100" 
                             :class="branchForm.permissions.includes(perm.id) ? 'bg-blue-600 text-white border-none shadow-xl shadow-blue-500/10 scale-110' : ''">
                           <component :is="getBenefitIcon(perm.name)" :size="24" stroke-width="2.5" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 uppercase tracking-tight">{{ perm.name }}</p>
                            <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5 opacity-80">ID: {{ perm.id }} • {{ perm.frequency }}</p>
                        </div>
                    </div>
                    <div class="w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2"
                         :class="branchForm.permissions.includes(perm.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 group-hover:border-blue-200'">
                        <Check v-if="branchForm.permissions.includes(perm.id)" :size="16" stroke-width="5" />
                    </div>
                </button>
            </div>
        </div>
      </div>
      <template #footer>
          <div class="flex items-center justify-end gap-10 w-full px-10 py-6 bg-gray-50/50 border-t border-gray-100 rounded-b-[32px]">
            <button @click="isEditModalOpen = false" class="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em] px-4">ยกเลิก</button>
            <button @click="handleSaveBranch" class="px-10 py-4 bg-blue-600 hover:bg-black text-white rounded-2xl text-sm font-medium transition-all active:scale-95 shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em]">
              บันทึกข้อมูลสาขา
            </button>
          </div>
      </template>
    </Modal>
 
    <!-- Delete Modal -->
    <Modal :is-open="isDeleteModalOpen" @close="isDeleteModalOpen = false" :title="selectedBranch?.status === 'Active' ? 'ระงับการทำงานสาขา' : 'กลับมาเปิดการทำงาน'" size="md">
        <div class="py-12 text-center space-y-8 px-6">
            <div :class="selectedBranch?.status === 'Active' ? 'bg-orange-50 text-orange-500 border-orange-100 shadow-xl shadow-orange-500/10' : 'bg-green-50 text-green-500 border-green-100 shadow-xl shadow-green-500/10'" class="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border-4 transition-all duration-700 animate-in zoom-in-50">
                <component :is="selectedBranch?.status === 'Active' ? AlertCircle : CheckCircle" :size="40" stroke-width="3" />
            </div>
            <div class="space-y-3 px-6">
                <h3 class="text-2xl font-medium text-gray-900 tracking-tighter uppercase leading-none">{{ selectedBranch?.status === 'Active' ? 'ระงับการทำงานสาขา?' : 'เปิดคืนการทำงาน?' }}</h3>
                <p class="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-wide">
                  สาขาพิกัด <span class="text-gray-900 underline">"{{ selectedBranch?.name }}"</span> จะถูกเปลี่ยนสถานะเป็น <span class="uppercase font-medium">{{ selectedBranch?.status === 'Active' ? 'ปิดการใช้งาน' : 'เปิดใช้งานปกติ' }}</span>
                </p>
            </div>
        </div>
        <template #footer>
            <div class="grid grid-cols-2 gap-4 w-full px-8 pb-8">
                <button @click="isDeleteModalOpen = false" class="py-5 text-[11px] font-medium text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">ย้อนกลับ</button>
                <button @click="confirmDelete" :class="selectedBranch?.status === 'Active' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-green-600 shadow-green-600/20'" class="py-5 text-white rounded-xl text-[11px] font-medium uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                  ยืนยันทำรายการ
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
