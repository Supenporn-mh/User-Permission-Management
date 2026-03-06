import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { Modal } from '../components/ui';
import { useApp } from '../context';

export default function Employees() {
    const {
        branchEmployees, setBranchEmployees, branchGroups,
        permissions, branchConfig, addLog
    } = useApp();

    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const calculateInheritedWallets = (employeeGroups) => {
        const wallets = {};
        employeeGroups.forEach(groupId => {
            const group = branchGroups.find(g => g.id === groupId);
            if (group) {
                group.rules.forEach(rule => {
                    const p = permissions.find(x => x.id === rule.permId);
                    if (p && branchConfig[rule.permId]?.enabled) {
                        wallets[rule.permId] = p;
                    }
                });
            }
        });
        return Object.values(wallets);
    };

    const handleSaveEmployee = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const groups = branchGroups
            .filter(g => formData.get(`group_${g.id}`))
            .map(g => g.id);

        setBranchEmployees(prev => prev.map(emp =>
            emp.id === editingEmployee.id ? { ...emp, groups } : emp
        ));

        addLog('Employee Update', `Updated employee groups for ${editingEmployee.name}`);
        setIsEmployeeModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Position</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Groups</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inherited Wallets</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {branchEmployees.map(emp => {
                            const inheritedWallets = calculateInheritedWallets(emp.groups);
                            return (
                                <tr key={emp.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{emp.name}</p>
                                                <p className="text-xs text-gray-400">{emp.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{emp.position}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {emp.groups.length > 0 ? emp.groups.map(gId => {
                                                const g = branchGroups.find(x => x.id === gId);
                                                return g ? <span key={gId} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{g.name}</span> : null;
                                            }) : <span className="text-gray-400 text-sm">No groups</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {inheritedWallets.length > 0 ? inheritedWallets.map(w =>
                                                <span key={w.id} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{w.name.split(' ')[0]}</span>
                                            ) : <span className="text-gray-400 text-sm">None</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                            <Edit size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Edit Employee Modal */}
            <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title={`Edit Employee: ${editingEmployee?.name}`} footer={<><button onClick={() => setIsEmployeeModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button type="submit" form="empForm" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Save</button></>}>
                <form id="empForm" onSubmit={handleSaveEmployee} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Assign to Groups</label>
                        <div className="space-y-2">
                            {branchGroups.map(group => (
                                <label key={group.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input type="checkbox" name={`group_${group.id}`} defaultChecked={editingEmployee?.groups.includes(group.id)} className="rounded" />
                                    <span className="text-sm">{group.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
