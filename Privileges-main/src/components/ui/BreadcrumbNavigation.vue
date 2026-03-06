<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApp } from '../../composables/useApp';
import { ChevronRight } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { userRole, managingBranch } = useApp();

const breadcrumbs = computed(() => {
  const crumbs = [];
  
  // 1. Root level (Always shows 'Admin')
  const rootPath = userRole.value === 'admin' ? '/branches' : '/wallet-config';
  crumbs.push({ label: 'Admin', path: rootPath });

  // 2. Logic based on Role & Context
  const currentPath = route.path;
  const isBranchModule = ['/wallet-config', '/employee-groups', '/employees'].includes(currentPath);

  if (isBranchModule && userRole.value === 'admin') {
    // System Admin: Show the path to the branch
    crumbs.push({ label: 'การจัดการสาขา', path: '/branches' });
    if (managingBranch.value) {
      // Branch Name as a non-clickable label
      crumbs.push({ label: branchName.value, path: '#' });
    }
  }

  // 3. Current Page Label (Last item)
  const pageLabel = route.meta?.label || 'หน้าหลัก';
  crumbs.push({ label: pageLabel, path: '#' });

  return crumbs;
});

const branchName = computed(() => managingBranch.value?.name || 'สาขา');

const navigate = (path) => {
  if (path !== '#') {
    router.push(path);
  }
};
</script>

<template>
  <nav class="flex items-center gap-2 text-[13px] font-medium animate-in fade-in slide-in-from-left-2 duration-500">
    <div v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center gap-2">
      <button 
        @click="navigate(crumb.path)"
        class="transition-all uppercase tracking-widest text-[11px]"
        :class="[
          (index === breadcrumbs.length - 1 || crumb.path === '#') 
            ? 'text-gray-900 font-bold cursor-default' 
            : 'text-gray-400 hover:text-blue-600 cursor-pointer pointer-events-auto'
        ]"
        :disabled="index === breadcrumbs.length - 1 || crumb.path === '#'"
      >
        {{ crumb.label }}
      </button>
      
      <span v-if="index < breadcrumbs.length - 1" class="text-gray-300 px-1 opacity-50">/</span>
    </div>
  </nav>
</template>
