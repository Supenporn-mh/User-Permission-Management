<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp';
import { ShieldCheck, Eye, EyeOff, LogIn } from 'lucide-vue-next';

const router = useRouter();
const { login, showToast } = useApp();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  errorMsg.value = '';
  if (!username.value || !password.value) {
    errorMsg.value = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
    return;
  }
  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    const success = login(username.value, password.value);
    if (success) {
      showToast('เข้าสู่ระบบสำเร็จ');
      // Redirect based on role
      const role = localStorage.getItem('userRole');
      if (role === 'branch') {
        router.push('/wallet-config');
      } else {
        router.push('/branches');
      }
    } else {
      errorMsg.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    }
    isLoading.value = false;
  }, 800);
};
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"></div>

    <div class="relative z-10 w-full max-w-md px-6">
      <!-- Logo / Branding -->
      <div class="text-center mb-12">
        <div class="w-20 h-20 bg-blue-600 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/30">
          <ShieldCheck :size="40" class="text-white" stroke-width="2" />
        </div>
        <h1 class="text-3xl font-medium text-gray-900 tracking-tight uppercase">Privilege Management</h1>
        <p class="text-sm font-medium text-gray-400 mt-2 uppercase tracking-widest">ระบบจัดการสิทธิ์สวัสดิการพนักงาน</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 p-10 space-y-8">
        <div class="space-y-1.5">
          <h2 class="text-xl font-medium text-gray-900 tracking-tight uppercase">เข้าสู่ระบบ</h2>
          <p class="text-xs font-medium text-gray-400 uppercase tracking-widest">กรอกข้อมูลผู้ใช้งานเพื่อเข้าสู่ระบบ</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username -->
          <div class="space-y-2">
            <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">ชื่อผู้ใช้งาน (Username)</label>
            <input 
              v-model="username"
              type="text"
              placeholder="กรอก Username"
              autocomplete="username"
              class="w-full pl-5 pr-4 py-4 bg-gray-50 border border-transparent rounded-[18px] text-base font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-inner transition-all placeholder-gray-300"
            />
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="text-[11px] font-medium text-gray-500 uppercase tracking-widest ml-1">รหัสผ่าน (Password)</label>
            <div class="relative">
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="กรอก Password"
                autocomplete="current-password"
                class="w-full pl-5 pr-14 py-4 bg-gray-50 border border-transparent rounded-[18px] text-base font-medium text-gray-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-inner transition-all placeholder-gray-300"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <Eye v-if="!showPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-600 text-center">
            {{ errorMsg }}
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] text-sm font-medium transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-wait"
          >
            <LogIn v-if="!isLoading" :size="18" stroke-width="3" />
            <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-8">
        Default: admin / admin123
      </p>
    </div>
  </div>
</template>
