import React from 'react';

const BADGE_STYLES = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-red-100 text-red-800 border-red-200',
    Hospital: 'bg-blue-100 text-blue-800 border-blue-200',
    Factory: 'bg-orange-100 text-orange-800 border-orange-200',
    School: 'bg-purple-100 text-purple-800 border-purple-200',
    Canteen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    auto_reset: 'bg-blue-50 text-blue-700 border-blue-100',
    top_up: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function Badge({ children, type }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${BADGE_STYLES[type] || BADGE_STYLES.default}`}>
            {children}
        </span>
    );
}
