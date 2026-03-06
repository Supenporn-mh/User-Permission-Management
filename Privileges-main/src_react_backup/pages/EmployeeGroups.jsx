import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Modal } from '../components/ui';
import { useApp } from '../context';

export default function EmployeeGroups() {
    const {
        branchGroups, setBranchGroups, permissions,
        getActiveBranchPerms, addLog
    } = useApp();

    const activeBranchPermIds = getActiveBranchPerms();

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '', message: '' });

    const handleSaveGroup = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const rules = activeBranchPermIds.map(pid => {
            if (formData.get(`perm_${pid}`)) {
                return {
                    permId: pid,
                    validFrom: formData.get(`date_from_${pid}`),
                    validTo: formData.get(`date_to_${pid}`)
                };
            }
            return null;
        }).filter(Boolean);

        const newGroup = {
            id: editingGroup ? editingGroup.id : `G${Date.now()}`,
            name: formData.get('groupName'),
            rules
        };

        if (editingGroup) {
            setBranchGroups(prev => prev.map(g => g.id === editingGroup.id ? newGroup : g));
            addLog('Group Update', `Updated group: ${newGroup.name}`);
        } else {
            setBranchGroups(prev => [...prev, newGroup]);
            addLog('Group Create', `Created group: ${newGroup.name}`);
        }

        setIsGroupModalOpen(false);
        setEditingGroup(null);
    };

    const promptDelete = (id, title, message) => {
        setDeleteModal({ isOpen: true, id, title, message });
    };

    const confirmDelete = () => {
        setBranchGroups(prev => prev.filter(g => g.id !== deleteModal.id));
        setDeleteModal({ ...deleteModal, isOpen: false });
        addLog('Group Delete', `Deleted group ID: ${deleteModal.id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Employee Groups</h2>
                <button onClick={() => { setEditingGroup(null); setIsGroupModalOpen(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <Plus size={16} /> Create Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branchGroups.map(group => (
                    <div key={group.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">{group.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingGroup(group); setIsGroupModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => promptDelete(group.id, 'Delete Group', `Are you sure you want to delete "${group.name}"?`)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-2">Assigned Wallets:</p>
                            <div className="flex flex-wrap gap-1">
                                {group.rules.map(r => {
                                    const p = permissions.find(x => x.id === r.permId);
                                    return p ? <span key={r.permId} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs">{p.name.split(' ')[0]}</span> : null;
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Group Modal */}
            <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={editingGroup ? 'Edit Group' : 'Create Group'} size="lg" footer={<><button onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button type="submit" form="groupForm" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Save</button></>}>
                <form id="groupForm" onSubmit={handleSaveGroup} className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Group Name</label><input name="groupName" defaultValue={editingGroup?.name} required className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm" /></div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Assign Wallets</label>
                        <div className="space-y-2">
                            {activeBranchPermIds.map(pid => {
                                const perm = permissions.find(p => p.id === pid);
                                const rule = editingGroup?.rules.find(r => r.permId === pid);

                                return perm ? (
                                    <div key={pid} className="p-3 border border-gray-100 rounded-lg">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name={`perm_${pid}`} defaultChecked={!!rule} className="rounded" />
                                            <span className="text-sm font-medium">{perm.name}</span>
                                        </label>
                                        <div className="flex gap-2 mt-2 ml-6">
                                            <input type="date" name={`date_from_${pid}`} defaultValue={rule?.validFrom} placeholder="From" className="flex-1 p-2 border border-gray-200 rounded text-sm" />
                                            <input type="date" name={`date_to_${pid}`} defaultValue={rule?.validTo} placeholder="To" className="flex-1 p-2 border border-gray-200 rounded text-sm" />
                                        </div>
                                    </div>
                                ) : null;
                            })}
                            {activeBranchPermIds.length === 0 && <p className="text-gray-400 text-sm">No wallets available for this branch.</p>}
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} title={deleteModal.title} footer={<><button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button></>}>
                <p className="text-gray-600">{deleteModal.message}</p>
            </Modal>
        </div>
    );
}
