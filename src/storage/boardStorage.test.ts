import { LocalStorageFallback } from './boardStorage';
import { STORAGE_CONFIG } from '../types/storage';
import { generateUUID } from '../utils/uuid';

// Mock the uuid module
jest.mock('../utils/uuid', () => ({
  generateUUID: jest.fn(),
}));

const mockGenerateUUID = generateUUID as jest.MockedFunction<typeof generateUUID>;

const mockUUID = 'test-uuid-1234-5678-abcd-ef0123456789';
const mockUUID2 = 'test-uuid-aaaa-bbbb-cccc-ddddeeeeeeee';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  
  // Setup default UUID mock behavior
  let uuidCounter = 0;
  mockGenerateUUID.mockImplementation(() => {
    uuidCounter++;
    return uuidCounter === 1 ? mockUUID : `${mockUUID2}-${uuidCounter}`;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('LocalStorageFallback', () => {
  let storage: LocalStorageFallback;

  beforeEach(() => {
    storage = new LocalStorageFallback();
  });

  describe('save', () => {
    test('creates board with UUID, name, grid, and timestamps', async () => {
      const now = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const input = { name: 'Test Board', grid: [[true, false], [false, true]] };
      const saved = await storage.save(input);

      expect(saved.id).toBe(mockUUID);
      expect(saved.name).toBe('Test Board');
      expect(saved.grid).toEqual([[true, false], [false, true]]);
      expect(saved.createdAt).toBe(now);
      expect(saved.updatedAt).toBe(now);
    });

    test('persists board to localStorage', async () => {
      const input = { name: 'Persisted Board', grid: [[true]] };
      await storage.save(input);

      const storedData = localStorage.getItem(STORAGE_CONFIG.localStorageKey);
      expect(storedData).not.toBeNull();
      
      const parsed = JSON.parse(storedData!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('Persisted Board');
    });

    test('appends to existing boards', async () => {
      await storage.save({ name: 'Board 1', grid: [[true]] });
      await storage.save({ name: 'Board 2', grid: [[false]] });

      const boards = await storage.list();
      expect(boards).toHaveLength(2);
    });
  });

  describe('load', () => {
    test('returns saved board by ID', async () => {
      const saved = await storage.save({ name: 'Loadable', grid: [[true, true]] });
      const loaded = await storage.load(saved.id);

      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(saved.id);
      expect(loaded!.name).toBe('Loadable');
      expect(loaded!.grid).toEqual([[true, true]]);
    });

    test('returns null for non-existent ID', async () => {
      const loaded = await storage.load('non-existent-id');
      expect(loaded).toBeNull();
    });

    test('returns null when storage is empty', async () => {
      const loaded = await storage.load('any-id');
      expect(loaded).toBeNull();
    });
  });

  describe('list', () => {
    test('returns empty array when no boards saved', async () => {
      const boards = await storage.list();
      expect(boards).toEqual([]);
    });

    test('returns all saved boards', async () => {
      await storage.save({ name: 'Board A', grid: [[true]] });
      await storage.save({ name: 'Board B', grid: [[false]] });

      const boards = await storage.list();
      expect(boards).toHaveLength(2);
    });

    test('returns boards sorted by updatedAt descending', async () => {
      const now = 1700000000000;
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(now)
        .mockReturnValueOnce(now + 1000);

      await storage.save({ name: 'Older', grid: [[true]] });
      await storage.save({ name: 'Newer', grid: [[false]] });

      const boards = await storage.list();
      expect(boards[0].name).toBe('Newer');
      expect(boards[1].name).toBe('Older');
    });
  });

  describe('delete', () => {
    test('removes board from storage', async () => {
      const saved = await storage.save({ name: 'To Delete', grid: [[true]] });
      
      await storage.delete(saved.id);
      
      const loaded = await storage.load(saved.id);
      expect(loaded).toBeNull();
    });

    test('does not affect other boards', async () => {
      const board1 = await storage.save({ name: 'Keep', grid: [[true]] });
      const board2 = await storage.save({ name: 'Delete', grid: [[false]] });

      await storage.delete(board2.id);

      const boards = await storage.list();
      expect(boards).toHaveLength(1);
      expect(boards[0].id).toBe(board1.id);
    });

    test('does nothing when ID does not exist', async () => {
      await storage.save({ name: 'Existing', grid: [[true]] });
      
      // Should not throw
      await storage.delete('non-existent-id');
      
      const boards = await storage.list();
      expect(boards).toHaveLength(1);
    });
  });

  describe('update', () => {
    test('updates board name', async () => {
      const saved = await storage.save({ name: 'Original', grid: [[true]] });

      const updated = await storage.update(saved.id, { name: 'Updated Name' });

      expect(updated.name).toBe('Updated Name');
      expect(updated.grid).toEqual([[true]]); // Grid unchanged
    });

    test('updates board grid', async () => {
      const saved = await storage.save({ name: 'Original', grid: [[true]] });

      const updated = await storage.update(saved.id, { grid: [[false, false]] });

      expect(updated.name).toBe('Original'); // Name unchanged
      expect(updated.grid).toEqual([[false, false]]);
    });

    test('updates updatedAt timestamp', async () => {
      const createTime = 1700000000000;
      const updateTime = 1700001000000;
      
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(createTime)
        .mockReturnValueOnce(updateTime);

      const saved = await storage.save({ name: 'Original', grid: [[true]] });
      const updated = await storage.update(saved.id, { name: 'Updated' });

      expect(saved.createdAt).toBe(createTime);
      expect(updated.createdAt).toBe(createTime); // createdAt unchanged
      expect(updated.updatedAt).toBe(updateTime);
    });

    test('throws error for non-existent ID', async () => {
      await expect(storage.update('non-existent-id', { name: 'New Name' }))
        .rejects
        .toThrow('Board with id non-existent-id not found');
    });

    test('persists updates to localStorage', async () => {
      const saved = await storage.save({ name: 'Original', grid: [[true]] });
      await storage.update(saved.id, { name: 'Persisted Update' });

      // Create new storage instance to verify persistence
      const newStorage = new LocalStorageFallback();
      const loaded = await newStorage.load(saved.id);

      expect(loaded!.name).toBe('Persisted Update');
    });
  });

  describe('edge cases', () => {
    test('handles corrupted localStorage gracefully', async () => {
      localStorage.setItem(STORAGE_CONFIG.localStorageKey, 'not valid json');
      
      const boards = await storage.list();
      expect(boards).toEqual([]);
    });

    test('handles empty grid', async () => {
      // Note: This tests storage behavior, not validation
      const saved = await storage.save({ name: 'Empty', grid: [] });
      const loaded = await storage.load(saved.id);
      
      expect(loaded!.grid).toEqual([]);
    });

    test('handles large grid', async () => {
      const largeGrid = Array(50).fill(null).map(() => Array(50).fill(true));
      const saved = await storage.save({ name: 'Large', grid: largeGrid });
      const loaded = await storage.load(saved.id);
      
      expect(loaded!.grid).toEqual(largeGrid);
    });
  });
});
