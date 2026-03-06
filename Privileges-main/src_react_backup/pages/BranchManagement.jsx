import React, { useState } from 'react';
import {
    Check, XSquare, Search, Filter, MoreHorizontal, Edit, Shield, UserCheck, Trash2, ToggleRight, ToggleLeft
} from 'lucide-react';
import { Badge, Modal } from '../components/ui';
import { useApp } from '../context';
import { renderIcon } from '../utils/iconUtils.jsx';

export default function BranchManagement() {
    const {
        branches, setBranches, userRole, setCurrentView,
        setManagingBranch, addLog, permissions
    } = useApp();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [selectedBranchIds, setSelectedBranchIds] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Modal states
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [isManagePermModalOpen, setIsManagePermModalOpen] = useState(false);
    const [managingBranchPerm, setManagingBranchPerm] = useState(null);
    const [tempBranchPerms, setTempBranchPerms] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState(null);
    const [selectedBulkPermissions, setSelectedBulkPermissions] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '', message: '' });

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === 'All' || b.type === filterType)
    );

    const toggleBranchSelection = (id) => {
        setSelectedBranchIds(prev => prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]);
    };

    const toggleBranchStatus = (id) => {
        if (userRole === 'Branch Admin') return;
        setBranches(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b));
    };

    const handleSaveBranch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedBranch = {
            ...editingBranch,
            name: formData.get('name'),
            type: formData.get('type'),
            status: formData.get('status')
        };
        setBranches(prev => prev.map(b => b.id === editingBranch.id ? updatedBranch : b));
        addLog('Branch Update', `Updated branch: ${updatedBranch.name}`);
        setIsBranchModalOpen(false);
        setEditingBranch(null);
    };

    const handleManageInternals = (branch) => {
        setManagingBranch(branch);
        setCurrentView('b_config');
        setActiveMenuId(null);
    };

    const handleTogglePermission = (permId) => {
        setTempBranchPerms(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
    };

    const saveBranchPermissions = () => {
        setBranches(prev => prev.map(b => b.id === managingBranchPerm.id ? { ...b, permissions: tempBranchPerms } : b));
        addLog('Permission Update', `Updated individual permissions for ${managingBranchPerm.name}`);
        setIsManagePermModalOpen(false);
        setManagingBranchPerm(null);
    };

    const handleBulkActionClick = (type) => {
        if (selectedBranchIds.length === 0) return;
        setBulkActionType(type);
        setSelectedBulkPermissions([]);
        setIsBulkModalOpen(true);
    };

    const executeBulkAction = () => {
        setBranches(prev => prev.map(branch => {
            if (!selectedBranchIds.includes(branch.id) || branch.status === 'Inactive') return branch;
            let newPerms = [...branch.permissions];
            if (bulkActionType === 'Enable') {
                selectedBulkPermissions.forEach(pId => { if (!newPerms.includes(pId)) newPerms.push(pId); });
            } else {
                newPerms = newPerms.filter(pId => !selectedBulkPermissions.includes(pId));
            }
            return { ...branch, permissions: newPerms };
        }));
        setIsBulkModalOpen(false);
        setSelectedBranchIds([]);
        addLog('Bulk Action', `${bulkActionType} permissions for selected branches`);
    };

    const promptDelete = (id, title, message) => {
        setDeleteModal({ isOpen: true, id, title, message });
        setActiveMenuId(null);
    };

    const confirmDelete = () => {
        setBranches(prev => prev.filter(b => b.id !== deleteModal.id));
        setDeleteModal({ ...deleteModal, isOpen: false });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Branch Management</h2>
                <div className="flex gap-2">
                    {selectedBranchIds.length > 0 && (
                        <>
                            <button onClick={() => handleBulkActionClick('Enable')} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-2">
                                <Check size={16} /> Enable Permissions
                            </button>
                            <button onClick={() => handleBulkActionClick('Disable')} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
                                <XSquare size={16} /> Disable Permissions
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="ค้นหาสาขา..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                    >
                        <option value="All">ทุกประเภท</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Factory">Factory</option>
                        <option value="School">School</option>
                        <option value="Canteen">Canteen</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    onChange={e => setSelectedBranchIds(e.target.checked ? filteredBranches.map(b => b.id) : [])}
                                    className="rounded"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Branch</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Permissions</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredBranches.map(branch => (
                            <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedBranchIds.includes(branch.id)}
                                        onChange={() => toggleBranchSelection(branch.id)}
                                        className="rounded"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            {branch.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{branch.name}</p>
                                            <p className="text-xs text-gray-400">{branch.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3"><Badge type={branch.type}>{branch.type}</Badge></td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleBranchStatus(branch.id)} disabled={userRole === 'Branch Admin'} className="flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed">
                                        {branch.status === 'Active' ? <ToggleRight className="text-green-500" size={24} /> : <ToggleLeft className="text-gray-400" size={24} />}
                                        <Badge type={branch.status}>{branch.status}</Badge>
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {branch.permissions.length > 0 ? branch.permissions.slice(0, 2).map(pId => {
                                            const p = permissions.find(x => x.id === pId);
                                            return p ? <span key={pId} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">{p.name.split(' ')[0]}</span> : null;
                                        }) : <span className="text-gray-400 text-sm">No permissions</span>}
                                        {branch.permissions.length > 2 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{branch.permissions.length - 2}</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right relative">
                                    <button onClick={() => setActiveMenuId(activeMenuId === branch.id ? null : branch.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                    {activeMenuId === branch.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                            <button onClick={() => { setEditingBranch(branch); setIsBranchModalOpen(true); setActiveMenuId(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                                <Edit size={14} /> Edit Details
                                            </button>
                                            <button onClick={() => { setManagingBranchPerm(branch); setTempBranchPerms([...branch.permissions]); setIsManagePermModalOpen(true); setActiveMenuId(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                                <Shield size={14} /> Manage Permissions
                                            </button>
                                            <button onClick={() => handleManageInternals(branch)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                                <UserCheck size={14} /> Manage Internals
                                            </button>
                                            <hr className="my-1" />
                                            <button onClick={() => promptDelete(branch.id, 'Delete Branch', `Are you sure you want to delete "${branch.name}"?`)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Branch Modal */}
            <Modal isOpen={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} title="Edit Branch" footer={<><button onClick={() => setIsBranchModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button type="submit" form="branchForm" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save</button></>}>
                <form id="branchForm" onSubmit={handleSaveBranch} className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Branch Name</label><input name="name" defaultValue={editingBranch?.name} required className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Type</label><select name="type" defaultValue={editingBranch?.type} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm"><option value="Hospital">Hospital</option><option value="Factory">Factory</option><option value="School">School</option><option value="Canteen">Canteen</option></select></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Status</label><select name="status" defaultValue={editingBranch?.status} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                </form>
            </Modal>

            {/* Manage Permissions Modal */}
            <Modal isOpen={isManagePermModalOpen} onClose={() => setIsManagePermModalOpen(false)} title={`Manage Permissions: ${managingBranchPerm?.name}`} footer={<><button onClick={() => setIsManagePermModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button onClick={saveBranchPermissions} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save</button></>}>
                <div className="space-y-3">{permissions.map(perm => (<div key={perm.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tempBranchPerms.includes(perm.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{renderIcon(perm.icon, 16)}</div><span className="font-medium text-sm">{perm.name}</span></div><button onClick={() => handleTogglePermission(perm.id)}>{tempBranchPerms.includes(perm.id) ? <ToggleRight className="text-blue-500" size={28} /> : <ToggleLeft className="text-gray-400" size={28} />}</button></div>))}</div>
            </Modal>

            {/* Bulk Action Modal */}
            <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title={`Bulk ${bulkActionType} Permissions`} footer={<><button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button onClick={executeBulkAction} disabled={selectedBulkPermissions.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">Apply to {selectedBranchIds.length} Branches</button></>}>
                <p className="text-sm text-gray-600 mb-4">Select permissions to {bulkActionType?.toLowerCase()}:</p>
                <div className="space-y-2">{permissions.map(perm => (<label key={perm.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={selectedBulkPermissions.includes(perm.id)} onChange={() => setSelectedBulkPermissions(prev => prev.includes(perm.id) ? prev.filter(id => id !== perm.id) : [...prev, perm.id])} className="rounded" /><span className="text-sm">{perm.name}</span></label>))}</div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} title={deleteModal.title} footer={<><button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button></>}>
                <p className="text-gray-600">{deleteModal.message}</p>
            </Modal>
        </div>
    );
}
