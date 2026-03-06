import React, { useState } from 'react';
import { ToggleRight, ToggleLeft } from 'lucide-react';
import { Badge } from '../components/ui';
import { useApp } from '../context';
import { renderIcon } from '../utils/iconUtils.jsx';

export default function WalletConfiguration() {
    const {
        permissions, branchConfig, setBranchConfig, getActiveBranchPerms
    } = useApp();

    const activeBranchPermIds = getActiveBranchPerms();

    const toggleBranchConfig = (permId) => {
        setBranchConfig(prev => ({
            ...prev,
            [permId]: {
                ...(prev[permId] || { enabled: false }),
                enabled: !prev[permId]?.enabled
            }
        }));
    };

    const updateBranchConfigDate = (permId, field, value) => {
        setBranchConfig(prev => ({
            ...prev,
            [permId]: {
                ...(prev[permId] || { enabled: false }),
                [field]: value
            }
        }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Wallet Configuration</h2>
            <p className="text-gray-500">Configure which wallets are active for this branch.</p>

            <div className="space-y-4">
                {activeBranchPermIds.map(pid => {
                    const perm = permissions.find(p => p.id === pid);
                    if (!perm) return null;

                    const config = branchConfig[pid] || { enabled: false, validFrom: '', validTo: '' };

                    return (
                        <div key={pid} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {renderIcon(perm.icon)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{perm.name}</h3>
                                        <Badge type={perm.type}>{perm.type === 'auto_reset' ? 'Auto Reset' : 'Top Up'}</Badge>
                                    </div>
                                </div>
                                <button onClick={() => toggleBranchConfig(pid)}>
                                    {config.enabled ? <ToggleRight className="text-emerald-500" size={32} /> : <ToggleLeft className="text-gray-400" size={32} />}
                                </button>
                            </div>

                            {config.enabled && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Valid From</label>
                                        <input
                                            type="date"
                                            value={config.validFrom}
                                            onChange={e => updateBranchConfigDate(pid, 'validFrom', e.target.value)}
                                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500">Valid To</label>
                                        <input
                                            type="date"
                                            value={config.validTo}
                                            onChange={e => updateBranchConfigDate(pid, 'validTo', e.target.value)}
                                            className="w-full mt-1 p-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {activeBranchPermIds.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No permissions assigned to this branch.
                    </div>
                )}
            </div>
        </div>
    );
}
