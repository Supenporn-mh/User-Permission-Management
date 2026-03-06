import React from 'react';
import { AppProvider, useApp } from './context';
import { Sidebar } from './components/layout';
import {
  BranchManagement,
  MasterPermissions,
  AuditLogs,
  WalletConfiguration,
  EmployeeGroups,
  Employees
} from './pages';

function AppContent() {
  const {
    userRole, setUserRole,
    currentView, setCurrentView,
    managingBranch, setManagingBranch
  } = useApp();

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        userRole={userRole}
        setUserRole={setUserRole}
        currentView={currentView}
        setCurrentView={setCurrentView}
        managingBranch={managingBranch}
        setManagingBranch={setManagingBranch}
      />

      <div className="flex-1 overflow-auto p-8">
        {currentView === 'branches' && <BranchManagement />}
        {currentView === 'master' && <MasterPermissions />}
        {currentView === 'audit' && <AuditLogs />}
        {currentView === 'b_config' && <WalletConfiguration />}
        {currentView === 'b_groups' && <EmployeeGroups />}
        {currentView === 'b_employees' && <Employees />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
