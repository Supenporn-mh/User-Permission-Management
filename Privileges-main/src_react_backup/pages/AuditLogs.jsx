import React from 'react';
import { Badge } from '../components/ui';
import { useApp } from '../context';

export default function AuditLogs() {
    const { logs } = useApp();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Audit Logs</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Admin</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 text-sm text-gray-500">{log.timestamp}</td>
                                <td className="px-4 py-3 text-sm font-medium">{log.admin}</td>
                                <td className="px-4 py-3"><Badge type="default">{log.action}</Badge></td>
                                <td className="px-4 py-3 text-sm text-gray-600">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
