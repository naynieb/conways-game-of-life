import { useState, useEffect, useRef, useCallback } from 'react';

interface SaveBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isSaving?: boolean;
}

export function SaveBoardModal({ isOpen, onClose, onSave, isSaving = false }: SaveBoardModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName && !isSaving) {
      onSave(trimmedName);
    }
  }, [name, isSaving, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [handleSave, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const canSave = name.trim().length > 0 && !isSaving;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 id="save-modal-title" className="text-xl font-semibold text-zinc-100 mb-4">
          Save Board
        </h2>
        
        <div className="mb-6">
          <label htmlFor="board-name" className="block text-sm text-zinc-400 mb-2">
            Board Name
          </label>
          <input
            ref={inputRef}
            id="board-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a name for this pattern..."
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg
                       text-zinc-100 placeholder-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={isSaving}
            maxLength={100}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                       rounded-lg border border-zinc-700 transition-colors
                       text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white 
                       rounded-lg border border-emerald-500 transition-colors
                       text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
