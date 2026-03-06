import { ref, reactive, provide, inject, toRefs } from 'vue';
import {
    INITIAL_BRANCHES,
    INITIAL_PERMISSIONS,
    INITIAL_LOGS,
    INITIAL_BRANCH_CONFIG,
    INITIAL_BRANCH_GROUPS,
    INITIAL_BRANCH_EMPLOYEES,
    BRANCH_TYPES
} from '../data/mockData';

const APP_SYMBOL = Symbol('APP_CONTEXT');

export function provideApp() {
    const userRole = ref(localStorage.getItem('userRole') || 'admin');
    const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true');
    const currentUser = ref(JSON.parse(localStorage.getItem('currentUser') || 'null'));

    const users = ref([
        { id: 'U001', name: 'ธนากร สมบูรณ์', username: 'admin', password: 'admin123', role: 'admin', status: 'Active' },
        { id: 'U002', name: 'สมชาย สายเสมอ', username: 'branch01', password: 'password123', role: 'branch', status: 'Active' },
    ]);

    const state = reactive({
        managingBranch: null,

        // Data
        branches: INITIAL_BRANCHES,
        permissions: INITIAL_PERMISSIONS,
        logs: INITIAL_LOGS,
        branchConfig: INITIAL_BRANCH_CONFIG,
        branchGroups: INITIAL_BRANCH_GROUPS,
        branchEmployees: INITIAL_BRANCH_EMPLOYEES,

        // UI state
        toast: { show: false, message: '', type: 'success' },
        isSidebarOpen: false
    });

    // ──────────────────────────────────────
    // Navigation
    // ──────────────────────────────────────
    const setUserRole = (role) => {
        userRole.value = role;
        localStorage.setItem('userRole', role);
        if (role === 'admin') {
            state.managingBranch = null;
        } else {
            // Default to first branch if not set
            if (!state.managingBranch && state.branches.length > 0) {
                state.managingBranch = state.branches[0];
            }
        }
    };

    const setManagingBranch = (branch) => {
        state.managingBranch = branch;
    };

    const login = (username, password) => {
        const user = users.value.find(u => u.username === username && u.password === password);
        if (user && user.status === 'Active') {
            isLoggedIn.value = true;
            currentUser.value = user;
            userRole.value = user.role;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Assign default branch for Branch Admin
            if (user.role === 'branch') {
                if (state.branches.length > 0) {
                    state.managingBranch = state.branches[0];
                }
            } else {
                state.managingBranch = null; // System Admin starts with no branch
            }
            return true;
        }
        return false;
    };

    const logout = () => {
        isLoggedIn.value = false;
        currentUser.value = null;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentUser');
    };

    const addUser = (userData) => {
        const newUser = {
            id: `U${Date.now().toString().slice(-3)}`,
            ...userData,
            status: userData.status || 'Active'
        };
        users.value.push(newUser);
        addLog('User Create', `Created user: ${newUser.username}`);
        showToast(`User "${newUser.username}" created successfully`);
        return newUser;
    };

    const updateUser = (userId, updates) => {
        const index = users.value.findIndex(u => u.id === userId);
        if (index !== -1) {
            users.value[index] = { ...users.value[index], ...updates };
            addLog('User Update', `Updated user: ${users.value[index].username}`);
            showToast(`User updated successfully`);
        }
    };

    // ──────────────────────────────────────
    // Toast
    // ──────────────────────────────────────
    const showToast = (message, type = 'success') => {
        state.toast = { show: true, message, type };
        setTimeout(() => { state.toast.show = false; }, 3000);
    };

    // ──────────────────────────────────────
    // Audit Logging
    // ──────────────────────────────────────
    const addLog = (action, details) => {
        const newLog = {
            id: Date.now(),
            admin: state.userRole,
            action,
            details,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        state.logs = [newLog, ...state.logs];
    };

    // ──────────────────────────────────────
    // Branch CRUD
    // ──────────────────────────────────────
    const addBranch = (branchData) => {
        const newBranch = {
            id: `B${Date.now()}`,
            name: branchData.name,
            type: branchData.type || 'Office',
            status: 'Active',
            permissions: branchData.permissions || [],
            pendingSync: false
        };
        state.branches.push(newBranch);
        addLog('Branch Create', `Created branch: ${newBranch.name}`);
        showToast(`Branch "${newBranch.name}" created successfully`);
        return newBranch;
    };

    const updateBranch = (branchId, updates) => {
        const index = state.branches.findIndex(b => b.id === branchId);
        if (index !== -1) {
            state.branches[index] = { ...state.branches[index], ...updates };
            addLog('Branch Update', `Updated branch: ${updates.name || state.branches[index].name}`);
            showToast(`Branch updated successfully`);
        }
    };

    const deleteBranch = (branchId) => {
        const branch = state.branches.find(b => b.id === branchId);
        if (branch) {
            state.branches = state.branches.filter(b => b.id !== branchId);
            addLog('Branch Delete', `Deleted branch: ${branch.name}`);
            showToast(`Branch "${branch.name}" deleted`, 'error');
        }
    };

    const toggleBranchStatus = (branchId) => {
        const branch = state.branches.find(b => b.id === branchId);
        if (branch) {
            branch.status = branch.status === 'Active' ? 'Inactive' : 'Active';
            addLog('Branch Status', `${branch.name} → ${branch.status}`);
            showToast(`${branch.name} is now ${branch.status}`);
        }
    };

    // ──────────────────────────────────────
    // Permission (Entitlement) CRUD
    // ──────────────────────────────────────
    const addPermission = (permData) => {
        const newPerm = {
            id: `P${Date.now()}`,
            name: permData.name,
            type: permData.type || 'auto_reset', // 'auto_reset' | 'top_up'
            icon: permData.icon || 'Gift',
            fundTypes: permData.fundTypes || ['Standard'],

            // Core Limits (null = Unlimited)
            timesPerDay: permData.timesPerDay !== undefined ? permData.timesPerDay : 3,
            timesPerWeek: permData.timesPerWeek !== undefined ? permData.timesPerWeek : null,
            timesPerMonth: permData.timesPerMonth !== undefined ? permData.timesPerMonth : null,
            timesPerCycle: permData.timesPerCycle !== undefined ? permData.timesPerCycle : null,
            amountPerTime: permData.amountPerTime !== undefined ? permData.amountPerTime : 50,
            totalValue: permData.totalValue !== undefined ? permData.totalValue : 150,

            // Cycle Config (for auto_reset)
            frequency: permData.frequency || 'Daily', // 'Daily', 'Weekly', 'Monthly', 'Matrix'
            specificWeeks: permData.specificWeeks || [], // [1, 2, 3, 4]
            monthlyCycleType: permData.monthlyCycleType || 'full_month', // 'full_month', 'first_day', 'last_day', 'specific_date'
            monthlyDates: permData.monthlyDates || [], // Array of days [1, 5, 20...]
            monthlySpecificDay: permData.monthlySpecificDay || null,
            matrixDays: permData.matrixDays || [], // [1, 2, 3...31]
            allowRollover: permData.allowRollover || false,

            // Scope for amountPerTime
            amountPerTimeScope: permData.amountPerTimeScope || 'per_day', // 'per_day' | 'per_week' | 'per_month'

            // Top Up Config
            topUpRoles: permData.topUpRoles || ['admin'], // ['admin', 'employee']

            status: 'Active'
        };
        state.permissions.push(newPerm);
        addLog('เพิ่มสิทธิ์ใหม่', `สร้างสิทธิ์: ${newPerm.name}`);
        showToast(`สร้างสิทธ์ "${newPerm.name}" เรียบร้อยแล้ว`);
        return newPerm;
    };

    const updatePermission = (permId, updates) => {
        const index = state.permissions.findIndex(p => p.id === permId);
        if (index !== -1) {
            state.permissions[index] = { ...state.permissions[index], ...updates };

            // If status changed to Disabled, propagate to all branches
            if (updates.status === 'Disabled') {
                state.branches.forEach(b => {
                    if (b.permissions.includes(permId)) {
                        b.status = 'Inactive'; // Logical choice: if center is disabled, branch's use of it is affected
                        // Or better: mark needing sync or force disable in config
                    }
                });
            }

            // Mark branches that use this permission as needing sync
            state.branches.forEach(b => {
                if (b.permissions.includes(permId)) {
                    b.pendingSync = true;
                }
            });
            addLog('แก้ไขสิทธิ์', `แก้ไขสิทธิ์: ${updates.name || state.permissions[index].name}`);
            showToast(`อัปเดตสิทธิ์เรียบร้อยแล้ว สาขาที่เกี่ยวข้องถูกทำเครื่องหมายเป็น "Pending Sync"`);
        }
    };

    const deletePermission = (permId) => {
        const perm = state.permissions.find(p => p.id === permId);
        if (perm) {
            // Remove from all branches
            state.branches.forEach(b => {
                b.permissions = b.permissions.filter(pid => pid !== permId);
            });
            state.permissions = state.permissions.filter(p => p.id !== permId);
            addLog('Master Delete', `Deleted entitlement: ${perm.name}`);
            showToast(`Entitlement "${perm.name}" deleted`, 'error');
        }
    };

    const togglePermissionStatus = (permId) => {
        const perm = state.permissions.find(p => p.id === permId);
        if (perm) {
            perm.status = perm.status === 'Active' ? 'Disabled' : 'Active';

            // PROPAGATION: If Center disables it, all branches that have it assigned must respect it
            // We'll mark them as pending sync or just show as disabled in their view
            if (perm.status === 'Disabled') {
                addLog('ปิดใช้งานสิทธิ์กลาง', `${perm.name} ถูกปิดใช้งานในระดับศูนย์กลาง`);
                showToast(`ปิดใช้งานสิทธิ์ ${perm.name} ในทุกสาขา`);
            } else {
                addLog('เปิดใช้งานสิทธิ์กลาง', `${perm.name} กลับมาใช้งานได้ตามปกติ`);
                showToast(`เปิดใช้งานสิทธิ์ ${perm.name} เรียบร้อยแล้ว`);
            }
        }
    };

    // ──────────────────────────────────────
    // Branch ↔ Permission Assignment
    // ──────────────────────────────────────
    const assignPermToBranch = (branchId, permId) => {
        const branch = state.branches.find(b => b.id === branchId);
        if (branch && !branch.permissions.includes(permId)) {
            branch.permissions.push(permId);
            const permName = state.permissions.find(p => p.id === permId)?.name;
            addLog('Permission Assign', `Assigned "${permName}" to ${branch.name}`);
            showToast(`Permission assigned to ${branch.name}`);
        }
    };

    const removePermFromBranch = (branchId, permId) => {
        const branch = state.branches.find(b => b.id === branchId);
        if (branch) {
            branch.permissions = branch.permissions.filter(pid => pid !== permId);
            const permName = state.permissions.find(p => p.id === permId)?.name;
            addLog('Permission Remove', `Removed "${permName}" from ${branch.name}`);
            showToast(`Permission removed from ${branch.name}`);
        }
    };

    // ──────────────────────────────────────
    // Branch Admin: Sync (Accept Pending Updates)
    // ──────────────────────────────────────
    const syncBranchPermissions = (branchId) => {
        const branch = state.branches.find(b => b.id === branchId);
        if (branch) {
            branch.pendingSync = false;
            addLog('Branch Sync', `${branch.name} synced latest permission changes`);
            showToast(`${branch.name} synced successfully`);
        }
    };

    // ──────────────────────────────────────
    // Employee Management
    // ──────────────────────────────────────
    const addEmployee = (empData) => {
        const newEmp = {
            id: `E${Date.now()}`,
            externalId: empData.externalId || `EMP-${Date.now().toString().slice(-4)}`,
            name: empData.name,
            position: empData.position || '',
            department: empData.department || '',
            groups: empData.groups || [],
            status: 'Active'
        };
        state.branchEmployees.push(newEmp);
        addLog('Employee Add', `Added employee: ${newEmp.name}`);
        showToast(`Employee "${newEmp.name}" added`);
        return newEmp;
    };

    const updateEmployee = (empId, updates) => {
        const index = state.branchEmployees.findIndex(e => e.id === empId);
        if (index !== -1) {
            state.branchEmployees[index] = { ...state.branchEmployees[index], ...updates };
            addLog('Employee Update', `Updated: ${updates.name || state.branchEmployees[index].name}`);
            showToast('Employee updated');
        }
    };

    const deleteEmployee = (empId) => {
        const emp = state.branchEmployees.find(e => e.id === empId);
        if (emp) {
            state.branchEmployees = state.branchEmployees.filter(e => e.id !== empId);
            addLog('Employee Delete', `Deleted employee: ${emp.name}`);
            showToast(`"${emp.name}" removed`, 'error');
        }
    };

    const importEmployees = (employeeList) => {
        let count = 0;
        employeeList.forEach(emp => {
            const newEmp = {
                id: `E${Date.now()}_${count}`,
                name: emp.name,
                position: emp.position || '',
                groups: [],
                status: 'Active'
            };
            state.branchEmployees.push(newEmp);
            count++;
        });
        addLog('Employee Import', `Imported ${count} employees from file`);
        showToast(`${count} employees imported successfully`);
    };

    const assignEmployeeToGroup = (empId, groupId) => {
        const emp = state.branchEmployees.find(e => e.id === empId);
        if (emp && !emp.groups.includes(groupId)) {
            // Check for conflicting permissions
            const newGroup = state.branchGroups.find(g => g.id === groupId);
            const existingPermIds = new Set();
            emp.groups.forEach(gId => {
                const g = state.branchGroups.find(gr => gr.id === gId);
                g?.rules?.forEach(r => existingPermIds.add(r.permId));
            });
            const conflicts = newGroup?.rules?.filter(r => existingPermIds.has(r.permId)) || [];
            if (conflicts.length > 0) {
                // Return conflict info so the UI can show a popup
                return { conflict: true, conflictingPerms: conflicts.map(c => c.permId) };
            }
            emp.groups.push(groupId);
            addLog('Group Assign', `${emp.name} → ${newGroup?.name}`);
            showToast(`${emp.name} added to ${newGroup?.name}`);
            return { conflict: false };
        }
        return { conflict: false };
    };

    const removeEmployeeFromGroup = (empId, groupId) => {
        const emp = state.branchEmployees.find(e => e.id === empId);
        if (emp) {
            emp.groups = emp.groups.filter(g => g !== groupId);
            const groupName = state.branchGroups.find(g => g.id === groupId)?.name;
            addLog('Group Remove', `${emp.name} removed from ${groupName}`);
        }
    };

    // ──────────────────────────────────────
    // Branch Admin: Helpers
    // ──────────────────────────────────────
    const getActiveBranchPerms = () => {
        if (!state.managingBranch) return [];
        const currentBranch = state.branches.find(b => b.id === state.managingBranch.id);
        return currentBranch ? currentBranch.permissions : [];
    };

    // ──────────────────────────────────────
    // Provide everything
    // ──────────────────────────────────────
    const context = {
        ...toRefs(state),
        // Auth
        userRole, isLoggedIn, currentUser, users,
        login, logout, addUser, updateUser,
        // Nav
        setUserRole, setManagingBranch,
        // Toast
        showToast,
        // Audit
        addLog,
        // Branch CRUD
        addBranch, updateBranch, deleteBranch, toggleBranchStatus,
        // Permission CRUD
        addPermission, updatePermission, deletePermission, togglePermissionStatus,
        // Branch ↔ Permission
        assignPermToBranch, removePermFromBranch, syncBranchPermissions,
        // Employee
        addEmployee, updateEmployee, deleteEmployee, importEmployees,
        assignEmployeeToGroup, removeEmployeeFromGroup,
        // Helpers
        getActiveBranchPerms
    };

    provide(APP_SYMBOL, context);
    return context;
}

export function useApp() {
    const context = inject(APP_SYMBOL);
    if (!context) {
        throw new Error('useApp must be used within provideApp');
    }
    return context;
}
