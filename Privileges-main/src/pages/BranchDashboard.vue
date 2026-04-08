<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp';
import { 
  Building2, Wallet, Users, Database, Shield, ChevronRight, Edit, ArrowLeft
} from 'lucide-vue-next';

const router = useRouter();
const { managingBranch, permissions } = useApp();

// If no branch is selected, redirect back to branches
if (!managingBranch.value) {
    router.push('/branches');
}

const getPermissionName = (id) => {
  if (!permissions.value) return '...';
  const perm = permissions.value.find(p => p.id === id);
  return perm ? perm.name : 'ไม่ทราบชื่อ';
};

const navigateTo = (path) => {
    router.push(path);
};
</script>

<template>
  <div v-if="managingBranch" class="max-w-[1200px] mx-auto space-y-5 animate-in pb-8 px-4">
    <!-- Back Button -->
    <div class="px-2">
      <button @click="navigateTo('/branches')" class="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors group">
        <div class="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
          <ArrowLeft :size="16" stroke-width="2.5" />
        </div>
        <span class="text-xs font-bold uppercase tracking-widest">ย้อนกลับไปรายการสาขา</span>
      </button>
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
      <div class="space-y-1.5">
        <h2 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">รายละเอียดสาขา</h2>
        <p class="text-[15px] font-medium text-gray-400 tracking-wide uppercase">จัดการข้อมูลทั่วไป พนักงาน สิทธิ์ และตั้งค่ากระเป๋าเงิน</p>
      </div>
      <div class="px-6 py-4 bg-white border border-gray-100 rounded-[20px] shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 :size="20" />
          </div>
          <div>
              <p class="text-sm font-medium text-gray-900 uppercase">{{ managingBranch.name }}</p>
              <p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{{ managingBranch.type }}</p>
          </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <!-- Wallet Card -->
        <button @click="navigateTo('/wallet-config')" class="p-6 bg-white border border-gray-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left group">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Wallet :size="24" stroke-width="2.5" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 uppercase tracking-tight">ตั้งค่า Wallet</h3>
            <p class="text-[11px] text-gray-400 font-medium uppercase mt-1 line-clamp-2 leading-relaxed">กำหนดวงเงินและเงื่อนไขการใช้กระเป๋าเงินสาขา</p>
            <div class="mt-4 flex justify-end">
                <ChevronRight :size="18" class="text-gray-300 group-hover:text-blue-500" stroke-width="3" />
            </div>
        </button>

        <!-- Employee Groups Card -->
        <button @click="navigateTo('/employee-groups')" class="p-6 bg-white border border-gray-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left group">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Database :size="24" stroke-width="2.5" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 uppercase tracking-tight">กลุ่มพนักงาน</h3>
            <p class="text-[11px] text-gray-400 font-medium uppercase mt-1 line-clamp-2 leading-relaxed">จัดการกลุ่มและสิทธิ์ตามระดับพนักงานในสาขา</p>
            <div class="mt-4 flex justify-end">
                <ChevronRight :size="18" class="text-gray-300 group-hover:text-indigo-500" stroke-width="3" />
            </div>
        </button>

        <!-- Employees Card -->
        <button @click="navigateTo('/employees')" class="p-6 bg-white border border-gray-100 rounded-[32px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left group">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users :size="24" stroke-width="2.5" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 uppercase tracking-tight">รายชื่อพนักงาน</h3>
            <p class="text-[11px] text-gray-400 font-medium uppercase mt-1 line-clamp-2 leading-relaxed">จัดการข้อมูลพนักงานและการนำเข้ารายชื่อ</p>
            <div class="mt-4 flex justify-end">
                <ChevronRight :size="18" class="text-gray-300 group-hover:text-emerald-500" stroke-width="3" />
            </div>
        </button>
    </div>

    <!-- General Info & Permissions (Readonly overview for branch) -->
    <div class="px-2 mt-8">
        <div class="bg-white rounded-[32px] border border-gray-100/50 shadow-sm p-6">
            <div class="flex items-center gap-4 mb-6">
                <Shield :size="24" class="text-gray-400" />
                <h3 class="text-xl font-medium text-gray-900 uppercase tracking-tight">ข้อมูลพื้นฐานและสิทธิ์สวัสดิการที่ได้รับ</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-4">
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">รายละเอียดสาขา</p>
                    <div class="bg-gray-50 rounded-[20px] p-5 space-y-3 border border-gray-100">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500 font-medium uppercase">รหัสสาขา</span>
                            <span class="text-sm font-medium text-gray-900 uppercase">{{ managingBranch.id }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500 font-medium uppercase">ชื่อสาขา</span>
                            <span class="text-sm font-medium text-gray-900 uppercase">{{ managingBranch.name }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500 font-medium uppercase">ประเภท</span>
                            <span class="text-sm font-medium text-gray-900 uppercase">{{ managingBranch.type }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500 font-medium uppercase">สถานะการทำงาน</span>
                            <span class="text-sm font-medium" :class="managingBranch.status === 'Active' ? 'text-green-600' : 'text-red-500'">{{ managingBranch.status === 'Active' ? 'เปิดใช้งาน' : 'ระงับการทำงาน' }}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">สิทธิ์สวัสดิการ ({{ managingBranch.permissions?.length || 0 }} รายการ)</p>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="benefitId in (managingBranch.permissions || [])" :key="benefitId" 
                             class="flex items-center gap-2 px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-medium text-blue-600 uppercase tracking-tight">
                            <Shield :size="14" stroke-width="2.5" />
                            <span>{{ getPermissionName(benefitId) }}</span>
                        </div>
                        <div v-if="!managingBranch.permissions?.length" class="text-sm text-gray-400 italic">ไม่มีสิทธิ์สวัสดิการ</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
