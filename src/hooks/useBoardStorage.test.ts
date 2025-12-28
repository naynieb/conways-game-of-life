import { renderHook, act, waitFor } from '@testing-library/react';
import { useBoardStorage } from './useBoardStorage';
import { boardStorage } from '../storage/boardStorage';
import type { SavedBoard } from '../types/storage';

// Mock the boardStorage module
jest.mock('../storage/boardStorage', () => ({
  boardStorage: {
    list: jest.fn(),
    save: jest.fn(),
    load: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}));

const mockBoardStorage = boardStorage as jest.Mocked<typeof boardStorage>;

// Helper to create mock boards
function createMockBoard(overrides: Partial<SavedBoard> = {}): SavedBoard {
  return {
    id: 'test-id-1',
    name: 'Test Board',
    grid: [[true, false], [false, true]],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    ...overrides,
  };
}

describe('useBoardStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBoardStorage.list.mockResolvedValue([]);
  });

  describe('initial state', () => {
    test('starts with empty savedBoards', async () => {
      const { result } = renderHook(() => useBoardStorage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.savedBoards).toEqual([]);
    });

    test('starts with currentBoardId as null', async () => {
      const { result } = renderHook(() => useBoardStorage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.currentBoardId).toBeNull();
    });

    test('starts with error as null', async () => {
      const { result } = renderHook(() => useBoardStorage());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      expect(result.current.error).toBeNull();
    });

    test('loads boards on mount', async () => {
      const mockBoards = [createMockBoard()];
      mockBoardStorage.list.mockResolvedValue(mockBoards);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.savedBoards).toEqual(mockBoards);
      });

      expect(mockBoardStorage.list).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveBoard', () => {
    test('saves board and updates savedBoards', async () => {
      const newBoard = createMockBoard({ id: 'new-id', name: 'New Board' });
      mockBoardStorage.save.mockResolvedValue(newBoard);
      mockBoardStorage.list.mockResolvedValue([newBoard]);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let savedBoard: SavedBoard | null = null;
      await act(async () => {
        savedBoard = await result.current.saveBoard({ name: 'New Board', grid: [[true]] });
      });

      expect(savedBoard).toEqual(newBoard);
      expect(result.current.savedBoards).toContainEqual(newBoard);
    });

    test('sets currentBoardId after save', async () => {
      const newBoard = createMockBoard({ id: 'saved-id' });
      mockBoardStorage.save.mockResolvedValue(newBoard);
      mockBoardStorage.list.mockResolvedValue([newBoard]);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.saveBoard({ name: 'Test', grid: [[true]] });
      });

      expect(result.current.currentBoardId).toBe('saved-id');
    });

    test('returns null on save error', async () => {
      mockBoardStorage.save.mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let savedBoard: SavedBoard | null = null;
      await act(async () => {
        savedBoard = await result.current.saveBoard({ name: 'Test', grid: [[true]] });
      });

      expect(savedBoard).toBeNull();
      expect(result.current.error).toBe('Save failed');
    });
  });

  describe('loadBoard', () => {
    test('returns board and sets currentBoardId', async () => {
      const mockBoard = createMockBoard({ id: 'load-id' });
      mockBoardStorage.load.mockResolvedValue(mockBoard);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loadedBoard: SavedBoard | null = null;
      await act(async () => {
        loadedBoard = await result.current.loadBoard('load-id');
      });

      expect(loadedBoard).toEqual(mockBoard);
      expect(result.current.currentBoardId).toBe('load-id');
    });

    test('returns null for non-existent board', async () => {
      mockBoardStorage.load.mockResolvedValue(null);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loadedBoard: SavedBoard | null = null;
      await act(async () => {
        loadedBoard = await result.current.loadBoard('non-existent');
      });

      expect(loadedBoard).toBeNull();
    });

    test('returns null on load error', async () => {
      mockBoardStorage.load.mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loadedBoard: SavedBoard | null = null;
      await act(async () => {
        loadedBoard = await result.current.loadBoard('error-id');
      });

      expect(loadedBoard).toBeNull();
      expect(result.current.error).toBe('Load failed');
    });
  });

  describe('deleteBoard', () => {
    test('removes board from list', async () => {
      const board1 = createMockBoard({ id: 'keep-id', name: 'Keep' });
      const board2 = createMockBoard({ id: 'delete-id', name: 'Delete' });
      
      mockBoardStorage.list
        .mockResolvedValueOnce([board1, board2])
        .mockResolvedValueOnce([board1]);
      mockBoardStorage.delete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.savedBoards).toHaveLength(2);
      });

      let success = false;
      await act(async () => {
        success = await result.current.deleteBoard('delete-id');
      });

      expect(success).toBe(true);
      expect(mockBoardStorage.delete).toHaveBeenCalledWith('delete-id');
    });

    test('clears currentBoardId when deleting active board', async () => {
      const board = createMockBoard({ id: 'active-id' });
      mockBoardStorage.list.mockResolvedValue([board]);
      mockBoardStorage.load.mockResolvedValue(board);
      mockBoardStorage.delete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First load the board to set it as current
      await act(async () => {
        await result.current.loadBoard('active-id');
      });

      expect(result.current.currentBoardId).toBe('active-id');

      // Then delete it
      mockBoardStorage.list.mockResolvedValue([]);
      await act(async () => {
        await result.current.deleteBoard('active-id');
      });

      expect(result.current.currentBoardId).toBeNull();
    });

    test('does not clear currentBoardId when deleting different board', async () => {
      const board1 = createMockBoard({ id: 'active-id' });
      const board2 = createMockBoard({ id: 'other-id' });
      mockBoardStorage.list.mockResolvedValue([board1, board2]);
      mockBoardStorage.load.mockResolvedValue(board1);
      mockBoardStorage.delete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadBoard('active-id');
      });

      mockBoardStorage.list.mockResolvedValue([board1]);
      await act(async () => {
        await result.current.deleteBoard('other-id');
      });

      expect(result.current.currentBoardId).toBe('active-id');
    });

    test('returns false on delete error', async () => {
      mockBoardStorage.delete.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.deleteBoard('error-id');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('updateBoard', () => {
    test('updates board grid', async () => {
      const original = createMockBoard({ id: 'update-id' });
      const updated = { ...original, grid: [[false, false]], updatedAt: 1700001000000 };
      
      mockBoardStorage.update.mockResolvedValue(updated);
      mockBoardStorage.list.mockResolvedValue([updated]);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updatedBoard: SavedBoard | null = null;
      await act(async () => {
        updatedBoard = await result.current.updateBoard('update-id', [[false, false]]);
      });

      expect(updatedBoard).toEqual(updated);
      expect(mockBoardStorage.update).toHaveBeenCalledWith('update-id', { grid: [[false, false]] });
    });

    test('returns null on update error', async () => {
      mockBoardStorage.update.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let updatedBoard: SavedBoard | null = null;
      await act(async () => {
        updatedBoard = await result.current.updateBoard('error-id', [[true]]);
      });

      expect(updatedBoard).toBeNull();
      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('refreshBoards', () => {
    test('fetches all boards from storage', async () => {
      const boards = [createMockBoard({ id: 'refresh-1' }), createMockBoard({ id: 'refresh-2' })];
      mockBoardStorage.list.mockResolvedValue(boards);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.savedBoards).toEqual(boards);
      });

      // Update mock and refresh
      const newBoards = [...boards, createMockBoard({ id: 'refresh-3' })];
      mockBoardStorage.list.mockResolvedValue(newBoards);

      await act(async () => {
        await result.current.refreshBoards();
      });

      expect(result.current.savedBoards).toEqual(newBoards);
    });

    test('sets error on refresh failure', async () => {
      mockBoardStorage.list
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Refresh failed'));

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshBoards();
      });

      expect(result.current.error).toBe('Refresh failed');
    });
  });

  describe('clearCurrentBoard', () => {
    test('sets currentBoardId to null', async () => {
      const board = createMockBoard({ id: 'clear-id' });
      mockBoardStorage.load.mockResolvedValue(board);

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadBoard('clear-id');
      });

      expect(result.current.currentBoardId).toBe('clear-id');

      act(() => {
        result.current.clearCurrentBoard();
      });

      expect(result.current.currentBoardId).toBeNull();
    });
  });

  describe('setCurrentBoardId', () => {
    test('sets currentBoardId to specified value', async () => {
      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setCurrentBoardId('manual-id');
      });

      expect(result.current.currentBoardId).toBe('manual-id');
    });

    test('can set currentBoardId to null', async () => {
      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setCurrentBoardId('some-id');
      });

      expect(result.current.currentBoardId).toBe('some-id');

      act(() => {
        result.current.setCurrentBoardId(null);
      });

      expect(result.current.currentBoardId).toBeNull();
    });
  });

  describe('error handling', () => {
    test('clears previous error on successful operation', async () => {
      mockBoardStorage.list.mockRejectedValueOnce(new Error('Initial error'));

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      // Successful refresh should clear error
      mockBoardStorage.list.mockResolvedValue([]);
      await act(async () => {
        await result.current.refreshBoards();
      });

      expect(result.current.error).toBeNull();
    });

    test('handles non-Error objects in catch', async () => {
      mockBoardStorage.list.mockRejectedValue('string error');

      const { result } = renderHook(() => useBoardStorage());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load saved boards');
      });
    });
  });
});
