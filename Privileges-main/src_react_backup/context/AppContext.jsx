import React, { createContext, useContext, useState } from 'react';
import {
    INITIAL_PERMISSIONS,
    INITIAL_BRANCHES,
    INITIAL_LOGS,
    INITIAL_BRANCH_CONFIG,
    INITIAL_BRANCH_GROUPS,
    INITIAL_BRANCH_EMPLOYEES
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    // Core states
    const [userRole, setUserRole] = useState('System Admin');
    const [currentView, setCurrentView] = useState('branches');
    const [managingBranch, setManagingBranch] = useState(null);

    // Data states
    const [branches, setBranches] = useState(INITIAL_BRANCHES);
    const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
    const [logs, setLogs] = useState(INITIAL_LOGS);

    // Branch Admin states
    const [branchConfig, setBranchConfig] = useState(INITIAL_BRANCH_CONFIG);
    const [branchGroups, setBranchGroups] = useState(INITIAL_BRANCH_GROUPS);
    const [branchEmployees, setBranchEmployees] = useState(INITIAL_BRANCH_EMPLOYEES);

    // Helper functions
    const addLog = (action, details) => {
        const newLog = {
            id: Date.now(),
            admin: userRole,
            action,
            details,
            timestamp: new Date().toLocaleString('th-TH')
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const getCurrentBranchId = () => managingBranch ? managingBranch.id : 'B001';

    const getActiveBranchPerms = () => {
        return branches.find(b => b.id === getCurrentBranchId())?.permissions || [];
    };

    const value = {
        // Core
        userRole, setUserRole,
        currentView, setCurrentView,
        managingBranch, setManagingBranch,

        // Data
        branches, setBranches,
        permissions, setPermissions,
        logs, setLogs,

        // Branch Admin
        branchConfig, setBranchConfig,
        branchGroups, setBranchGroups,
        branchEmployees, setBranchEmployees,

        // Helpers
        addLog,
        getCurrentBranchId,
        getActiveBranchPerms,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
