import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameBoard } from './GameBoard';

// Mock the boardStorage module to prevent async state updates after tests complete
jest.mock('../storage/boardStorage', () => ({
  boardStorage: {
    list: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue({ id: 'test-id', name: 'Test', grid: [], createdAt: Date.now(), updatedAt: Date.now() }),
    load: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(null),
  },
}));

describe('GameBoard', () => {
  // Wait for initial board loading to complete after each render
  const renderGameBoard = async () => {
    const result = render(<GameBoard />);
    await waitFor(() => {
      // The hook starts with isLoading=false, sets it to true, then back to false
      // We just need to wait for any pending state updates to flush
    });
    return result;
  };
  test('renders the game title', async () => {
    await renderGameBoard();
    expect(screen.getByText("Conway's Game of Life")).toBeDefined();
  });

  test('renders the Clear button', async () => {
    await renderGameBoard();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDefined();
  });

  test('renders the Import label', async () => {
    await renderGameBoard();
    expect(screen.getByText('Import')).toBeDefined();
  });

  test('renders the generation counter starting at 0', async () => {
    await renderGameBoard();
    expect(screen.getByText(/Generation:/)).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
  });

  test('renders the grid', async () => {
    await renderGameBoard();
    expect(screen.getByRole('grid', { name: 'Game of Life grid' })).toBeDefined();
  });

  test('clicking a cell toggles its state', async () => {
    await renderGameBoard();

    const cells = screen.getAllByRole('gridcell');
    expect(cells[0].getAttribute('aria-label')).toBe('dead');

    fireEvent.click(cells[0]);

    expect(cells[0].getAttribute('aria-label')).toBe('alive');
  });

  test('Clear button resets all cells to dead', async () => {
    await renderGameBoard();

    // Toggle some cells to alive
    const cells = screen.getAllByRole('gridcell');
    fireEvent.click(cells[0]);
    fireEvent.click(cells[1]);
    fireEvent.click(cells[2]);

    expect(cells[0].getAttribute('aria-label')).toBe('alive');
    expect(cells[1].getAttribute('aria-label')).toBe('alive');
    expect(cells[2].getAttribute('aria-label')).toBe('alive');

    // Click Clear
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    // All cells should be dead now
    const updatedCells = screen.getAllByRole('gridcell');
    for (const cell of updatedCells) {
      expect(cell.getAttribute('aria-label')).toBe('dead');
    }
  });

  test('renders helper text with keyboard shortcuts', async () => {
    await renderGameBoard();
    expect(screen.getByText(/Click cells to toggle/)).toBeDefined();
    expect(screen.getByText(/Space to play\/pause/)).toBeDefined();
  });

  test('renders play button initially', async () => {
    await renderGameBoard();
    expect(screen.getByRole('button', { name: /play simulation/i })).toBeDefined();
  });

  test('renders undo and redo buttons', async () => {
    await renderGameBoard();
    expect(screen.getByRole('button', { name: /undo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /redo/i })).toBeDefined();
  });

  test('renders step button', async () => {
    await renderGameBoard();
    expect(screen.getByRole('button', { name: /step forward/i })).toBeDefined();
  });

  test('renders max generations slider', async () => {
    await renderGameBoard();
    expect(screen.getByLabelText(/max generations/i)).toBeDefined();
  });
});
