import React from 'react';
import { Shield, Building2, Settings, History, Wallet, Users, Briefcase, ArrowLeft } from 'lucide-react';

export default function Sidebar({
    userRole,
    setUserRole,
    currentView,
    setCurrentView,
    managingBranch,
    setManagingBranch
}) {
    const isSystemAdmin = userRole === 'System Admin';
    const isManaging = !!managingBranch;
    const showBranchMenu = !isSystemAdmin || isManaging;

    const handleRoleSwitch = () => {
        const newRole = userRole === 'System Admin' ? 'Branch Admin' : 'System Admin';
        setUserRole(newRole);
        setManagingBranch(null);
        setCurrentView(newRole === 'System Admin' ? 'branches' : 'b_config');
    };

    const handleBackToEnterprise = () => {
        setManagingBranch(null);
        setCurrentView('branches');
    };

    return (
        <div className="w-64 flex flex-col h-full shadow-xl bg-slate-900 text-white">
            {/* Header */}
            <div className={`p-6 border-b border-slate-800 ${isManaging ? 'bg-emerald-900/30' : ''}`}>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Shield className={showBranchMenu ? "text-emerald-400" : "text-blue-400"} />
                    {isSystemAdmin ? (isManaging ? 'Managing Branch' : 'System Admin') : 'Branch Admin'}
                </h1>
                <p className="text-xs text-slate-400 mt-1 truncate">
                    {isManaging ? managingBranch.name : (isSystemAdmin ? 'Enterprise Management' : 'โรงพยาบาลกรุงเทพ (HQ)')}
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {isManaging && (
                    <button
                        onClick={handleBackToEnterprise}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 mb-4 border border-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>กลับสู่ระดับองค์กร</span>
                    </button>
                )}

                {!showBranchMenu ? (
                    <>
                        <NavButton
                            icon={Building2}
                            label="Branch Management"
                            active={currentView === 'branches'}
                            onClick={() => setCurrentView('branches')}
                            color="blue"
                        />
                        <NavButton
                            icon={Settings}
                            label="Master Permissions"
                            active={currentView === 'master'}
                            onClick={() => setCurrentView('master')}
                            color="blue"
                        />
                        <NavButton
                            icon={History}
                            label="Audit Logs"
                            active={currentView === 'audit'}
                            onClick={() => setCurrentView('audit')}
                            color="blue"
                        />
                    </>
                ) : (
                    <>
                        <NavButton
                            icon={Wallet}
                            label="Wallet Configuration"
                            active={currentView === 'b_config'}
                            onClick={() => setCurrentView('b_config')}
                            color="emerald"
                        />
                        <NavButton
                            icon={Users}
                            label="Employee Groups"
                            active={currentView === 'b_groups'}
                            onClick={() => setCurrentView('b_groups')}
                            color="emerald"
                        />
                        <NavButton
                            icon={Briefcase}
                            label="Employees"
                            active={currentView === 'b_employees'}
                            onClick={() => setCurrentView('b_employees')}
                            color="emerald"
                        />
                    </>
                )}
            </nav>

            {/* Role Switcher */}
            {!isManaging && (
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleRoleSwitch}
                        className={`w-full text-xs font-bold py-2 px-3 rounded-md border flex items-center justify-center gap-2 transition-colors ${userRole === 'System Admin'
                                ? 'bg-indigo-500 hover:bg-indigo-600 border-indigo-600'
                                : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600'
                            }`}
                    >
                        <Users size={14} /> {userRole}
                    </button>
                </div>
            )}
        </div>
    );
}

function NavButton({ icon: Icon, label, active, onClick, color }) {
    const activeClass = color === 'blue'
        ? 'bg-blue-600 shadow-lg text-white'
        : 'bg-emerald-600 shadow-lg text-white';

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? activeClass : 'text-slate-300 hover:bg-slate-800'
                }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );
}
