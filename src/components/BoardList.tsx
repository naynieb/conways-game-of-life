import { useState, useRef, useEffect, useCallback } from 'react';
import type { SavedBoard } from '../types/storage';

interface BoardListProps {
  boards: SavedBoard[];
  currentBoardId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Format a timestamp as a relative or absolute date string.
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function BoardList({ 
  boards, 
  currentBoardId, 
  onLoad, 
  onDelete, 
  isLoading = false 
}: BoardListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLoad = useCallback((id: string) => {
    onLoad(id);
    setIsOpen(false);
  }, [onLoad]);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  }, [onDelete]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                   rounded-lg border border-zinc-700 transition-colors
                   text-sm font-medium flex items-center gap-2
                   disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>Load</span>
        {boards.length > 0 && (
          <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-xs">
            {boards.length}
          </span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full mt-2 right-0 w-72 bg-zinc-900 border border-zinc-700 
                     rounded-xl shadow-2xl overflow-hidden z-50"
          role="listbox"
        >
          {boards.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">
              No saved boards yet
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {boards.map((board) => {
                const isActive = board.id === currentBoardId;
                const rows = board.grid.length;
                const cols = board.grid[0]?.length ?? 0;
                
                return (
                  <li key={board.id}>
                    <button
                      onClick={() => handleLoad(board.id)}
                      className={`w-full px-4 py-3 flex items-start gap-3 text-left
                                  transition-colors hover:bg-zinc-800
                                  ${isActive ? 'bg-zinc-800 border-l-2 border-emerald-500' : ''}`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-100 font-medium truncate">
                            {board.name}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-emerald-600 rounded text-xs text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <span>{rows}×{cols}</span>
                          <span>•</span>
                          <span>{formatDate(board.updatedAt)}</span>
                        </div>
                        <div className="text-xs text-zinc-600 font-mono mt-0.5 truncate">
                          ID: {board.id.slice(0, 8)}...
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleDelete(e, board.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 
                                   rounded transition-colors"
                        title="Delete board"
                        aria-label={`Delete ${board.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
