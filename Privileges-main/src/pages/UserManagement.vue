<script setup>
import { ref, computed } from 'vue';
import { 
  Users, Search, Plus, MoreHorizontal, Edit, Trash2, Shield, 
  ChevronRight, ChevronLeft, UserPlus, Key, Eye, EyeOff
} from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';
import { useApp } from '../composables/useApp';

const { users, addUser, updateUser, showToast, addLog } = useApp();

const searchTerm = ref('');
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const activeMenuId = ref(null);
const showPassword = ref(false);

const userForm = ref({
  id: '',
  name: '',
  username: '',
  password: '',
  role: 'admin',
  status: 'Active'
});

const filteredUsers = computed(() => {
  if (!users.value) return [];
  return users.value.filter(u => 
    u.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const openAddModal = () => {
  userForm.value = {
    id: '',
    name: '',
    username: '',
    password: '',
    role: 'admin',
    status: 'Active'
  };
  isAddModalOpen.value = true;
};

const openEditModal = (user) => {
  userForm.value = { ...user };
  isEditModalOpen.value = true;
  activeMenuId.value = null;
};

const handleSave = () => {
  if (!userForm.value.name || !userForm.value.username || !userForm.value.password) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  if (isAddModalOpen.value) {
    addUser({ ...userForm.value });
  } else {
    updateUser(userForm.value.id, { ...userForm.value });
  }
  
  isAddModalOpen.value = false;
  isEditModalOpen.value = false;
};

const toggleStatus = (user) => {
  const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
  updateUser(user.id, { status: newStatus });
  addLog('User Status', `Changed ${user.username} to ${newStatus}`);
  activeMenuId.value = null;
};
</script>

<template>
  <div class="max-w-[1200px] mx-auto space-y-8 animate-in pb-20">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
      <div class="space-y-1.5">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">จัดการผู้ใช้งาน</h2>
        <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">จัดการรายชื่อผู้เข้าใช้งานระบบและกำหนดระดับสิทธิ์</p>
      </div>
      <button @click="openAddModal" class="bg-blue-600 hover:bg-black text-white px-8 py-4 rounded-xl font-medium uppercase tracking-widest text-sm shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
        <UserPlus :size="20" stroke-width="3" /> เพิ่มผู้ใช้งานใหม่
      </button>
    </div>

    <!-- Toolbar -->
    <div class="px-2">
      <div class="relative group max-w-md">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" :size="20" />
        <input 
          v-model="searchTerm"
          placeholder="ค้นหาชื่อ หรือ Username..." 
          class="w-full pl-16 pr-8 py-4 bg-white border border-gray-100 rounded-xl text-base font-medium text-gray-900 placeholder-gray-300 outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all" 
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100/50">
      <div v-if="filteredUsers.length > 0" class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="py-5 px-8 text-xs font-medium text-gray-400 uppercase tracking-widest">ข้อมูลผู้ใช้งาน</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Username</th>
              <th class="py-5 px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">ระดับสิทธิ์</th>
              <th class="py-5 px-4 text-center text-xs font-medium text-gray-400 uppercase tracking-widest">สถานะ</th>
              <th class="pr-8 pl-4 py-5 text-right text-xs font-medium text-gray-400 uppercase tracking-widest">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in filteredUsers" :key="user.id" class="group hover:bg-gray-50/50 transition-all cursor-default relative">
              <td class="py-5 px-8">
                <div class="flex items-center gap-4">
                  <div class="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-medium border border-blue-100">
                      {{ user.name.charAt(0) }}
                  </div>
                  <div>
                      <p class="text-[15px] font-medium text-gray-900 tracking-tight">{{ user.name }}</p>
                      <p class="text-[11px] text-gray-400 font-medium mt-0.5">ID: {{ user.id }}</p>
                  </div>
                </div>
              </td>
              <td class="py-5 px-4">
                <span class="text-sm font-medium text-gray-600">{{ user.username }}</span>
              </td>
              <td class="py-5 px-4">
                <span class="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {{ user.role === 'admin' ? 'แอดมินระบบ' : 'แอดมินสาขา' }}
                </span>
              </td>
              <td class="py-5 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                     :class="user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'">
                  <div class="w-1.5 h-1.5 rounded-full" :class="user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'"></div>
                  {{ user.status === 'Active' ? 'Active' : 'Inactive' }}
                </div>
              </td>
              <td class="py-5 pr-8 text-right relative">
                <button @click="activeMenuId = activeMenuId === user.id ? null : user.id" class="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all active:scale-95">
                   <MoreHorizontal :size="20" stroke-width="2.5" />
                </button>
                
                <!-- Action Dropdown -->
                <div v-if="activeMenuId === user.id" class="absolute right-8 top-14 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                   <button @click="openEditModal(user)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
                      <Edit :size="16" class="text-gray-400" />
                      <span class="text-sm font-medium text-gray-700 uppercase tracking-tight">แก้ไขข้อมูล</span>
                   </button>
                   <button @click="toggleStatus(user)" class="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
                      <Shield :size="16" :class="user.status === 'Active' ? 'text-red-400' : 'text-green-400'" />
                      <span class="text-sm font-medium uppercase tracking-tight" :class="user.status === 'Active' ? 'text-red-500' : 'text-green-600'">
                        {{ user.status === 'Active' ? 'ระงับการทำงาน' : 'เปิดใช้งาน' }}
                      </span>
                   </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="py-20 text-center space-y-4">
        <Users :size="48" class="text-gray-200 mx-auto" />
        <p class="text-gray-400 font-medium">ไม่พบรายชื่อผู้ใช้งาน</p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Modal :is-open="isAddModalOpen || isEditModalOpen" @close="isAddModalOpen = isEditModalOpen = false" :title="isAddModalOpen ? 'เพิ่มผู้ใช้งานใหม่' : 'แก้ไขข้อมูลผู้ใช้งาน'" size="xl">
        <div class="space-y-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                    <input v-model="userForm.name" placeholder="ระบุชื่อจริง" class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all" />
                </div>
                <div class="space-y-2">
                    <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">Username</label>
                    <input v-model="userForm.username" :disabled="isEditModalOpen" placeholder="สำหรับเข้าสู่ระบบ" class="w-full pl-5 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all disabled:opacity-50" />
                </div>
                <div class="space-y-3">
                    <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <div class="relative">
                        <input :type="showPassword ? 'text' : 'password'" v-model="userForm.password" placeholder="กำหนดรหัสผ่าน" class="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 shadow-inner transition-all" />
                        <button @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Eye v-if="!showPassword" :size="16"/><EyeOff v-else :size="16"/></button>
                    </div>
                </div>
                <div class="space-y-3">
                    <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">สถานะผู้ใช้งาน</label>
                    <div class="flex gap-4">
                        <button v-for="s in ['Active', 'Inactive']" :key="s" @click="userForm.status = s" 
                                class="flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl border-2 transition-all active:scale-95"
                                :class="userForm.status === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                            {{ s }}
                        </button>
                    </div>
                </div>
                <div class="space-y-3 md:col-span-2">
                    <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ระดับสิทธิ์ (Role)</label>
                    <div class="flex gap-4">
                        <button v-for="r in [{v:'admin', l:'แอดมินระบบ (Central Admin)'}, {v:'branch', l:'แอดมินสาขา (Branch Admin)'}]" :key="r.v" @click="userForm.role = r.v" 
                                class="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center gap-3"
                                :class="userForm.role === r.v ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'">
                            <Shield :size="14" v-if="userForm.role === r.v"/>
                            {{ r.l }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex items-center justify-end gap-10 w-full px-10 py-6 bg-gray-50/50 border-t border-gray-100 rounded-b-3xl">
               <button @click="isAddModalOpen = isEditModalOpen = false" class="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em]">ยกเลิก</button>
               <button @click="handleSave" class="px-10 py-4 bg-blue-600 hover:bg-black text-white rounded-xl text-sm font-medium transition-all active:scale-95 shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em]">
                  บันทึกข้อมูล
               </button>
            </div>
        </template>
    </Modal>
  </div>
</template>
