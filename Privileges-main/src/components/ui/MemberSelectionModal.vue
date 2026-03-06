<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, X, Trash2, Check, User, ChevronRight, ChevronLeft } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  allEmployees: {
    type: Array,
    default: () => []
  },
  alreadyInGroupIds: {
    type: Array,
    default: () => []
  },
  branchName: String,
  groupName: String
});

const emit = defineEmits(['close', 'confirm']);

const searchTerm = ref('');
const selectedTemp = ref([]); // Array of employee objects being "staged"

// Computed: employees available to be picked (not already in group)
const availableEmployees = computed(() => {
  return props.allEmployees.filter(emp => !props.alreadyInGroupIds.includes(emp.id));
});

// Filtered available list based on search
const filteredAvailable = computed(() => {
  if (!searchTerm.value) return availableEmployees.value;
  const term = searchTerm.value.toLowerCase();
  return availableEmployees.value.filter(emp => 
    emp.name.toLowerCase().includes(term) || 
    emp.externalId.toLowerCase().includes(term)
  );
});

const isSelected = (empId) => {
  return selectedTemp.value.some(e => e.id === empId);
};

const toggleSelection = (emp) => {
  const index = selectedTemp.value.findIndex(e => e.id === emp.id);
  if (index === -1) {
    selectedTemp.value.push(emp);
  } else {
    selectedTemp.value.splice(index, 1);
  }
};

const removeFromSelection = (empId) => {
  selectedTemp.value = selectedTemp.value.filter(e => e.id !== empId);
};

const handleConfirm = () => {
  emit('confirm', [...selectedTemp.value]);
  selectedTemp.value = [];
};

const toggleSelectAllAvailable = () => {
  if (selectedTemp.value.length === filteredAvailable.value.length) {
    selectedTemp.value = [];
  } else {
    selectedTemp.value = [...filteredAvailable.value];
  }
};

const handleClose = () => {
  selectedTemp.value = [];
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="handleClose"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
        <div class="space-y-1">
          <h3 class="text-2xl font-medium text-gray-900 tracking-tight">เลือกรายชื่อ</h3>
          <p class="text-sm font-bold text-blue-600 uppercase tracking-widest">{{ props.groupName || 'Controller' }}</p>
        </div>
        <button @click="handleClose" class="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
          <X :size="24" />
        </button>
      </div>

      <!-- Body: Dual Pane -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Pane: Selection Pool -->
        <div class="w-7/12 border-r border-gray-100 flex flex-col">
          <div class="p-8 pb-4">
             <div class="relative group">
               <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="20" />
               <input v-model="searchTerm" placeholder="ค้นหาโดย รหัส / ชื่อ-นามสกุล / Card SN" 
                 class="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner" />
             </div>
          </div>

          <div class="flex-1 overflow-y-auto p-8 pt-0 space-y-2 custom-scrollbar">
             <!-- Table Header -->
             <div class="flex items-center px-4 py-3 bg-gray-50/50 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                <div class="w-10">
                  <input type="checkbox" 
                    :checked="selectedTemp.length > 0 && selectedTemp.length === filteredAvailable.length"
                    @change="toggleSelectAllAvailable"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer">
                </div>
                <div class="flex-1">รหัสพนักงาน ↑↓</div>
                <div class="flex-1">ชื่อ-นามสกุล (TH) ↑↓</div>
                <div class="flex-1">Card SN ↑↓</div>
             </div>

             <div v-for="emp in filteredAvailable" :key="emp.id" 
                @click="toggleSelection(emp)"
                class="flex items-center px-4 py-4 rounded-xl border transition-all cursor-pointer group"
                :class="isSelected(emp.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-blue-100 hover:bg-blue-50/30'">
                <div class="w-10">
                   <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                     :class="isSelected(emp.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 group-hover:border-blue-400'">
                     <Check v-if="isSelected(emp.id)" :size="12" stroke-width="4" />
                   </div>
                </div>
                <div class="flex-1 text-xs font-medium text-gray-600">{{ emp.externalId }}</div>
                <div class="flex-1 text-xs font-bold text-gray-900">{{ emp.name }}</div>
                <div class="flex-1 text-xs text-gray-500 font-mono truncate">{{ emp.card_sn || '-' }}</div>
             </div>

             <div v-if="filteredAvailable.length === 0" class="py-20 text-center space-y-3">
                <div class="w-12 h-12 bg-gray-50 rounded-xl mx-auto flex items-center justify-center text-gray-300">
                   <Search :size="24" />
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">ไม่พบผลลัพธ์</p>
             </div>
          </div>
        </div>

        <!-- Right Pane: Selected Tray -->
        <div class="w-5/12 bg-white flex flex-col">
          <div class="p-8 border-b border-gray-50">
             <p class="text-sm font-bold text-gray-900 uppercase tracking-widest">เลือก {{ selectedTemp.length }} รายชื่อ</p>
          </div>

          <div class="flex-1 overflow-y-auto p-8 space-y-3 custom-scrollbar">
             <div v-for="emp in selectedTemp" :key="'sel-'+emp.id" 
                class="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-right-2">
                <div class="flex items-center gap-3">
                   <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <User :size="20" />
                   </div>
                   <div>
                      <p class="text-sm font-bold text-gray-900 leading-tight">{{ emp.name }}</p>
                      <p class="text-[10px] font-medium text-gray-400 uppercase">{{ emp.externalId }}</p>
                   </div>
                </div>
                <button @click="removeFromSelection(emp.id)" class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-white transition-all">
                   <Trash2 :size="16" />
                </button>
             </div>

             <div v-if="selectedTemp.length === 0" class="flex-1 flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                 <div class="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-gray-200 border border-dashed border-gray-200">
                    <User :size="32" />
                 </div>
                 <p class="text-xs font-bold text-gray-300 uppercase tracking-widest leading-relaxed">ยังไม่ได้เลือกรายชื่อ<br>กรุณาเลือกรายชื่อจากด้านซ้าย</p>
             </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-10 py-8 border-t border-gray-100 flex items-center justify-end gap-4 bg-gray-50/30">
        <button @click="handleClose" class="px-10 py-4 text-xs font-bold text-blue-600 border border-blue-600 rounded-xl uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95">
          ยกเลิก
        </button>
        <button @click="handleConfirm" :disabled="selectedTemp.length === 0" 
          class="px-12 py-4 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95">
          ยืนยัน
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>
