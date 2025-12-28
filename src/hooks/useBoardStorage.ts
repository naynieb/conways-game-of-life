/**
 * useBoardStorage - React hook for board persistence.
 * 
 * This hook wraps the storage layer and provides React state management
 * for saving, loading, and deleting game boards.
 * 
 * @example
 * ```tsx
 * const { savedBoards, saveBoard, loadBoard, deleteBoard, isLoading, error } = useBoardStorage();
 * 
 * // Save current board
 * await saveBoard({ name: 'My Pattern', grid });
 * 
 * // Load a saved board
 * const board = await loadBoard(boardId);
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { boardStorage } from '../storage/boardStorage';
import type { SavedBoard, SaveBoardInput } from '../types/storage';
import type { Grid } from '../types/game';

export interface UseBoardStorageReturn {
  savedBoards: SavedBoard[];
  currentBoardId: string | null;
  isLoading: boolean;
  error: string | null;
  saveBoard: (input: SaveBoardInput) => Promise<SavedBoard | null>;
  loadBoard: (id: string) => Promise<SavedBoard | null>;
  deleteBoard: (id: string) => Promise<boolean>;
  updateBoard: (id: string, grid: Grid) => Promise<SavedBoard | null>;
  refreshBoards: () => Promise<void>;
  clearCurrentBoard: () => void;
  setCurrentBoardId: (id: string | null) => void;
}

export function useBoardStorage(): UseBoardStorageReturn {
  const [savedBoards, setSavedBoards] = useState<SavedBoard[]>([]);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all saved boards from storage.
   */
  const refreshBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const boards = await boardStorage.list();
      setSavedBoards(boards);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load saved boards';
      setError(message);
      console.error('Failed to refresh boards:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load boards on mount.
   */
  useEffect(() => {
    refreshBoards();
  }, [refreshBoards]);

  /**
   * Save a new board.
   */
  const saveBoard = useCallback(async (input: SaveBoardInput): Promise<SavedBoard | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const saved = await boardStorage.save(input);
      setCurrentBoardId(saved.id);
      await refreshBoards();
      return saved;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save board';
      setError(message);
      console.error('Failed to save board:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoards]);

  /**
   * Load a board by ID.
   */
  const loadBoard = useCallback(async (id: string): Promise<SavedBoard | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const board = await boardStorage.load(id);
      if (board) {
        setCurrentBoardId(board.id);
      }
      return board;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load board';
      setError(message);
      console.error('Failed to load board:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a board by ID.
   */
  const deleteBoard = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await boardStorage.delete(id);
      
      // Clear current board if we deleted the active one
      if (currentBoardId === id) {
        setCurrentBoardId(null);
      }
      
      await refreshBoards();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete board';
      setError(message);
      console.error('Failed to delete board:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentBoardId, refreshBoards]);

  /**
   * Update an existing board's grid.
   */
  const updateBoard = useCallback(async (id: string, grid: Grid): Promise<SavedBoard | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await boardStorage.update(id, { grid });
      await refreshBoards();
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update board';
      setError(message);
      console.error('Failed to update board:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBoards]);

  /**
   * Clear the current board ID.
   */
  const clearCurrentBoard = useCallback(() => {
    setCurrentBoardId(null);
  }, []);

  return {
    savedBoards,
    currentBoardId,
    isLoading,
    error,
    saveBoard,
    loadBoard,
    deleteBoard,
    updateBoard,
    refreshBoards,
    clearCurrentBoard,
    setCurrentBoardId,
  };
}
