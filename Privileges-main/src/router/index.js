import { createRouter, createWebHistory } from 'vue-router'

import BranchManagement from '@/pages/BranchManagement.vue'
import MasterPermissions from '@/pages/MasterPermissions.vue'
import AuditLogs from '@/pages/AuditLogs.vue'
import WalletConfiguration from '@/pages/WalletConfiguration.vue'
import EmployeeGroups from '@/pages/EmployeeGroups.vue'
import Employees from '@/pages/Employees.vue'
import BranchDashboard from '@/pages/BranchDashboard.vue'
import Login from '@/pages/Login.vue'
import UserManagement from '@/pages/UserManagement.vue'
import { provideApp } from '@/composables/useApp'

const routes = [
    { path: '/login', name: 'login', component: Login, meta: { label: 'เข้าสู่ระบบ', public: true } },
    { path: '/', redirect: '/branches' },
    { path: '/branches', name: 'branches', component: BranchManagement, meta: { label: 'การจัดการสาขา', role: 'admin' } },
    { path: '/user-management', name: 'user-management', component: UserManagement, meta: { label: 'จัดการผู้ใช้งาน', role: 'admin' } },
    { path: '/master-permissions', name: 'master-permissions', component: MasterPermissions, meta: { label: 'สิทธิ์สวัสดิการกลาง', role: 'admin' } },
    { path: '/audit-logs', name: 'audit-logs', component: AuditLogs, meta: { label: 'ประวัติการทำรายการ', role: 'admin' } },
    { path: '/branch-dashboard', name: 'branch-dashboard', component: BranchDashboard, meta: { label: 'รายละเอียดสาขา', role: 'branch' } },
    { path: '/employees', name: 'employees', component: Employees, meta: { label: 'รายชื่อพนักงาน', role: 'branch' } },
    { path: '/employee-groups', name: 'employee-groups', component: EmployeeGroups, meta: { label: 'กลุ่มพนักงาน', role: 'branch' } },
    { path: '/wallet-config', name: 'wallet-config', component: WalletConfiguration, meta: { label: 'ตั้งค่า Wallet', role: 'branch' } },
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    // We need to access the app state. In a real app we might use a store.
    // Here we can peek at localStorage or use a singleton approach if provideApp allows.
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole') || 'admin';

    if (!to.meta.public && !isLoggedIn) {
        next('/login');
    } else if (to.name === 'login' && isLoggedIn) {
        next('/');
    } else if (to.meta.role && to.meta.role !== userRole) {
        // Simple role check: admin can't go to branch routes (actually requested to switch, but let's be strict for now or allow switching)
        // Given the requirement of workspace switching, we might allow it if the role is switched.
        next();
    } else {
        next();
    }
});

export default router
