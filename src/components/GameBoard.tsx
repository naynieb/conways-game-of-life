import { useRef, useCallback, useState } from 'react';
import { useGameOfLife } from '../hooks/useGameOfLife';
import { useBoardStorage } from '../hooks/useBoardStorage';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Grid } from './Grid';
import { ToastContainer } from './Toast';
import { SaveBoardModal } from './SaveBoardModal';
import { BoardList } from './BoardList';
import { useToast } from '../hooks/useToast';
import { validateGridJson } from '../utils/validation';
import { GRID_CONFIG } from '../config/gameConfig';

export function GameBoard() {
  const {
    grid,
    generationIndex,
    isPlaying,
    maxGenerations,
    conclusionReason,
    canUndo,
    canRedo,
    toggleCell,
    importGrid,
    clear,
    step,
    undo,
    redo,
    play,
    pause,
    setMaxGenerations,
    dismissConclusion,
  } = useGameOfLife({ rows: 25, cols: 40 });

  const {
    savedBoards,
    currentBoardId,
    isLoading: isStorageLoading,
    saveBoard,
    loadBoard,
    deleteBoard,
    clearCurrentBoard,
  } = useBoardStorage();

  const { toasts, dismissToast, showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  /**
   * Handle file import with validation.
   */
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = validateGridJson(e.target?.result as string);

      if (!result.success) {
        showError(result.error);
        return;
      }

      importGrid(result.data);
      clearCurrentBoard();
      showSuccess(`Pattern imported: ${result.data.length}×${result.data[0]?.length ?? 0} grid`);
    };

    reader.onerror = () => {
      showError('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);

    // Reset input to allow re-importing the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [importGrid, clearCurrentBoard, showSuccess, showError]);

  /**
   * Handle saving the current board.
   */
  const handleSaveBoard = useCallback(async (name: string) => {
    const saved = await saveBoard({ name, grid });
    if (saved) {
      showSuccess(`Board saved: "${name}"`);
      setIsSaveModalOpen(false);
    } else {
      showError('Failed to save board. Please try again.');
    }
  }, [grid, saveBoard, showSuccess, showError]);

  /**
   * Handle loading a saved board.
   */
  const handleLoadBoard = useCallback(async (id: string) => {
    const board = await loadBoard(id);
    if (board) {
      importGrid(board.grid);
      showSuccess(`Loaded: "${board.name}"`);
    } else {
      showError('Failed to load board. It may have been deleted.');
    }
  }, [loadBoard, importGrid, showSuccess, showError]);

  /**
   * Handle deleting a saved board.
   */
  const handleDeleteBoard = useCallback(async (id: string) => {
    const board = savedBoards.find(b => b.id === id);
    const success = await deleteBoard(id);
    if (success) {
      showSuccess(`Deleted: "${board?.name ?? 'Board'}"`);
    } else {
      showError('Failed to delete board. Please try again.');
    }
  }, [savedBoards, deleteBoard, showSuccess, showError]);

  /**
   * Handle clearing the grid (also clears current board association).
   */
  const handleClear = useCallback(() => {
    clear();
    clearCurrentBoard();
  }, [clear, clearCurrentBoard]);

  /**
   * Handle keyboard shortcuts.
   */
  useKeyboardShortcuts(
    {
      isPlaying,
      conclusionReason,
      canUndo,
      canRedo,
      isModalOpen: isSaveModalOpen,
    },
    {
      play,
      pause,
      step,
      undo,
      redo,
      onClear: handleClear,
      onSave: () => setIsSaveModalOpen(true),
    }
  );

  const currentBoard = savedBoards.find(b => b.id === currentBoardId);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 p-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-1">
          Conway's Game of Life
        </h1>
        <p className="text-zinc-500 text-sm">
          Click cells to toggle • Space to play/pause • Arrows to navigate
        </p>
      </div>

      {/* Current board indicator */}
      {currentBoard && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <span className="text-zinc-400 text-xs">Current:</span>
          <span className="text-emerald-400 text-sm font-medium">{currentBoard.name}</span>
          <span className="text-zinc-600 text-xs font-mono">({currentBoard.id.slice(0, 8)})</span>
        </div>
      )}

      {/* Grid */}
      <Grid grid={grid} toggleCell={toggleCell} />

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Time-travel controls */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo (go back one generation) [←]"
          aria-label="Undo"
        >
          ◀◀
        </button>

        <button
          onClick={step}
          disabled={isPlaying || !!conclusionReason}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          title="Step (advance one generation) [→]"
          aria-label="Step forward"
        >
          ▶|
        </button>

        {/* Play/Pause toggle */}
        <button
          onClick={isPlaying ? pause : play}
          disabled={!!conclusionReason && !isPlaying}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white 
                     rounded-lg border border-emerald-500 transition-colors
                     text-sm font-medium min-w-[80px] disabled:opacity-40 disabled:cursor-not-allowed"
          title={isPlaying ? 'Pause [Space]' : 'Play [Space]'}
          aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo (go forward one generation) [↑]"
          aria-label="Redo"
        >
          ▶▶
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-700" aria-hidden="true" />

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium"
          title="Clear grid [C]"
          aria-label="Clear grid"
        >
          Clear
        </button>

        <label className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                          rounded-lg border border-zinc-700 transition-colors
                          text-sm font-medium cursor-pointer">
          Import
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            aria-label="Import pattern from JSON file"
          />
        </label>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-700" aria-hidden="true" />

        {/* Save button */}
        <button
          onClick={() => setIsSaveModalOpen(true)}
          disabled={isStorageLoading}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 
                     rounded-lg border border-zinc-700 transition-colors
                     text-sm font-medium disabled:opacity-50"
          title="Save board [Ctrl+S]"
          aria-label="Save board"
        >
          Save
        </button>

        {/* Load dropdown */}
        <BoardList
          boards={savedBoards}
          currentBoardId={currentBoardId}
          onLoad={handleLoadBoard}
          onDelete={handleDeleteBoard}
          isLoading={isStorageLoading}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-700" aria-hidden="true" />
        
        {/* Generation counter with live region for screen readers */}
        <div className="text-zinc-400 text-sm font-mono" aria-live="polite" aria-atomic="true">
          Generation: <span className="text-emerald-400">{generationIndex}</span>
        </div>
      </div>

      {/* Max generations slider */}
      <div className="flex items-center gap-3">
        <label htmlFor="max-generations" className="text-zinc-400 text-sm">
          Max Generations:
        </label>
        <input
          id="max-generations"
          type="range"
          min={100}
          max={5000}
          step={100}
          value={maxGenerations}
          onChange={(e) => setMaxGenerations(Number(e.target.value))}
          className="w-48 accent-emerald-500"
          aria-valuemin={100}
          aria-valuemax={5000}
          aria-valuenow={maxGenerations}
        />
        <span className="text-zinc-300 text-sm font-mono w-12" aria-hidden="true">
          {maxGenerations}
        </span>
      </div>

      {/* Grid size info */}
      <p className="text-zinc-600 text-xs">
        Grid: {grid.length}×{grid[0]?.length ?? 0} • Max import: {GRID_CONFIG.maxRows}×{GRID_CONFIG.maxCols}
      </p>

      {/* Conclusion message */}
      {conclusionReason && (
        <div 
          className="flex items-center gap-4 px-4 py-3 bg-amber-900/30 border border-amber-700/50 rounded-lg"
          role="alert"
        >
          <span className="text-amber-200 text-sm">
            {conclusionReason === 'extinct' && '💀 All cells died (extinction).'}
            {conclusionReason === 'stable' && '🔒 Pattern became stable (no changes).'}
            {conclusionReason === 'limit' && `⚠️ Reached max generations limit (${maxGenerations}).`}
          </span>
          <button
            onClick={() => {
              dismissConclusion();
              handleClear();
            }}
            className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white 
                       rounded text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Save modal */}
      <SaveBoardModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveBoard}
        isSaving={isStorageLoading}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
