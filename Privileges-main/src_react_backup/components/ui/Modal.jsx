import React from 'react';
import { XSquare } from 'lucide-react';

const SIZE_CLASSES = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
};

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-xl shadow-2xl w-full ${SIZE_CLASSES[size]} overflow-hidden animate-in flex flex-col max-h-[90vh]`}>
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XSquare size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
