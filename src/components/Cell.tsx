import { memo } from 'react';

interface CellProps {
  alive: boolean;
  onClick: () => void;
}

export const Cell = memo(function Cell({ alive, onClick }: CellProps) {
  return (
    <div
      className={`
        w-4 h-4 border border-zinc-800
        transition-colors duration-75
        cursor-pointer
        ${alive 
          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
          : 'bg-zinc-900 hover:bg-zinc-700'
        }
      `}
      onClick={onClick}
      role="gridcell"
      aria-label={alive ? 'alive' : 'dead'}
    />
  );
});
