import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
        id="confirm-modal-container"
      >
        <div className="flex items-center gap-3 text-red-500 mb-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold font-display tracking-tight text-white">{title}</h3>
        </div>
        
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            id="confirm-modal-cancel-btn"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-750 active:bg-neutral-800 rounded-xl transition-colors cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id="confirm-modal-confirm-btn"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-red-600 hover:bg-red-500 active:bg-red-750 rounded-xl transition-colors cursor-pointer text-center"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
