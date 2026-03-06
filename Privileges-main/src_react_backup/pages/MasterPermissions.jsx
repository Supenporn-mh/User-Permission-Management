import React, { useState } from 'react';
import {
    Plus, Edit, Trash2, Settings, Shield, Coffee, DollarSign
} from 'lucide-react';
import { Badge, Modal } from '../components/ui';
import { useApp } from '../context';
import { renderIcon } from '../utils/iconUtils.jsx';
import { WEEK_DAYS } from '../data/mockData';

export default function MasterPermissions() {
    const { permissions, setPermissions, addLog } = useApp();

    // Local state for modals
    const [isPermModalOpen, setIsPermModalOpen] = useState(false);
    const [editingPerm, setEditingPerm] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '', message: '' });

    // Form state
    const [permFormType, setPermFormType] = useState('auto_reset');
    const [selectedFundTypes, setSelectedFundTypes] = useState([]);
    const [selectedFrequency, setSelectedFrequency] = useState('Daily');
    const [recurringWeeks, setRecurringWeeks] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });

    const openPermModal = (perm) => {
        setEditingPerm(perm);
        if (perm) {
            setPermFormType(perm.type || 'auto_reset');
            setSelectedFundTypes(perm.fundTypes || []);
            setSelectedFrequency(perm.frequency);
            setRecurringWeeks(perm.recurringRule?.weeks || { 1: [], 2: [], 3: [], 4: [], 5: [] });
        } else {
            setPermFormType('auto_reset');
            setSelectedFundTypes(['Auto Reset']);
            setSelectedFrequency('Daily');
            setRecurringWeeks({ 1: [], 2: [], 3: [], 4: [], 5: [] });
        }
        setIsPermModalOpen(true);
    };

    const handleSavePermission = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newPerm = {
            id: editingPerm ? editingPerm.id : `P${Date.now()}`,
            name: formData.get('name'),
            type: permFormType,
            icon: editingPerm?.icon || (permFormType === 'auto_reset' ? 'Coffee' : 'DollarSign'),
            fundTypes: permFormType === 'auto_reset' ? ['Auto Reset'] : selectedFundTypes,
            value: permFormType === 'auto_reset' ? parseFloat(formData.get('value')) : 0,
            frequency: permFormType === 'auto_reset' ? selectedFrequency : 'No Reset',
            usageLimit: permFormType === 'auto_reset' ? parseInt(formData.get('usageLimit')) : null,
            recurringRule: selectedFrequency === 'Recurring' ? { type: 'WeekGrid', weeks: recurringWeeks } : null
        };

        if (editingPerm) {
            setPermissions(prev => prev.map(p => p.id === editingPerm.id ? newPerm : p));
            addLog('Master Update', `Updated permission: ${newPerm.name}`);
        } else {
            setPermissions(prev => [...prev, newPerm]);
            addLog('Master Create', `Created permission: ${newPerm.name}`);
        }
        setIsPermModalOpen(false);
    };

    const handleFundTypeToggle = (typeId) => {
        setSelectedFundTypes(prev => prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]);
    };

    const handleGridToggle = (weekNum, dayId) => {
        setRecurringWeeks(prev => {
            const currentDays = prev[weekNum] || [];
            return { ...prev, [weekNum]: currentDays.includes(dayId) ? currentDays.filter(d => d !== dayId) : [...currentDays, dayId] };
        });
    };

    const promptDelete = (id, title, message) => {
        setDeleteModal({ isOpen: true, id, title, message });
    };

    const confirmDelete = () => {
        setPermissions(prev => prev.filter(p => p.id !== deleteModal.id));
        setDeleteModal({ ...deleteModal, isOpen: false });
        addLog('Master Delete', `Deleted permission ID: ${deleteModal.id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Master Permissions</h2>
                <button onClick={() => openPermModal(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Plus size={16} /> Create Permission
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map(perm => (
                    <div key={perm.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${perm.type === 'auto_reset' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {renderIcon(perm.icon, 24)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{perm.name}</h3>
                                    <p className="text-xs text-gray-400">{perm.id}</p>
                                </div>
                            </div>
                            <Badge type={perm.type}>{perm.type === 'auto_reset' ? 'Auto Reset' : 'Top Up'}</Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                            <div><p className="text-gray-400 text-xs">Value</p><p className="font-medium">฿{perm.value}</p></div>
                            <div><p className="text-gray-400 text-xs">Frequency</p><p className="font-medium">{perm.frequency}</p></div>
                            <div><p className="text-gray-400 text-xs">Limit</p><p className="font-medium">{perm.usageLimit ?? 'Unlimited'}</p></div>
                            <div><p className="text-gray-400 text-xs">Fund Types</p><p className="font-medium">{perm.fundTypes.length}</p></div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => openPermModal(perm)} className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                                <Edit size={14} /> Edit
                            </button>
                            <button onClick={() => promptDelete(perm.id, 'Delete Permission', `Are you sure you want to delete "${perm.name}"?`)} className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Permission Modal */}
            <Modal
                isOpen={isPermModalOpen}
                onClose={() => setIsPermModalOpen(false)}
                title={editingPerm ? 'Edit Permission' : 'Create Permission'}
                size="lg"
                footer={
                    <>
                        <button type="button" onClick={() => setIsPermModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" form="permForm" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save</button>
                    </>
                }
            >
                <form id="permForm" onSubmit={handleSavePermission} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Permission Name</label>
                        <input name="name" defaultValue={editingPerm?.name} required className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                        <div className="flex gap-2 mt-1">
                            <button type="button" onClick={() => setPermFormType('auto_reset')} className={`flex-1 p-3 rounded-lg border-2 transition-all ${permFormType === 'auto_reset' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                <Coffee className="mx-auto mb-1" /><span className="text-sm">Auto Reset</span>
                            </button>
                            <button type="button" onClick={() => setPermFormType('top_up')} className={`flex-1 p-3 rounded-lg border-2 transition-all ${permFormType === 'top_up' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                                <DollarSign className="mx-auto mb-1" /><span className="text-sm">Top Up</span>
                            </button>
                        </div>
                    </div>
                    {permFormType === 'auto_reset' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Value (฿)</label><input name="value" type="number" defaultValue={editingPerm?.value || 100} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm" /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase">Usage Limit</label><input name="usageLimit" type="number" defaultValue={editingPerm?.usageLimit || 1} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm" /></div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Frequency</label>
                                <select value={selectedFrequency} onChange={e => setSelectedFrequency(e.target.value)} className="w-full mt-1 p-2.5 border border-gray-200 rounded-lg text-sm">
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Recurring">Recurring (Custom)</option>
                                </select>
                            </div>
                            {selectedFrequency === 'Recurring' && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-3">Select active days for each week:</p>
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5].map(week => (
                                            <div key={week} className="flex items-center gap-2">
                                                <span className="w-16 text-xs text-gray-400">Week {week}</span>
                                                <div className="flex gap-1">
                                                    {WEEK_DAYS.map(day => (
                                                        <button
                                                            key={day.id}
                                                            type="button"
                                                            onClick={() => handleGridToggle(week, day.id)}
                                                            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${(recurringWeeks[week] || []).includes(day.id) ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                                                        >
                                                            {day.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {permFormType === 'top_up' && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Fund Types</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['Employee Fill', 'Admin Fill'].map(ft => (
                                    <button
                                        key={ft}
                                        type="button"
                                        onClick={() => handleFundTypeToggle(ft)}
                                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${selectedFundTypes.includes(ft) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-gray-200'}`}
                                    >
                                        {ft}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} title={deleteModal.title} footer={<><button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button></>}>
                <p className="text-gray-600">{deleteModal.message}</p>
            </Modal>
        </div>
    );
}
