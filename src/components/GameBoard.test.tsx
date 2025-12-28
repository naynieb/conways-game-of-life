import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';

describe('GameBoard', () => {
  test('renders the game title', () => {
    render(<GameBoard />);
    expect(screen.getByText("Conway's Game of Life")).toBeDefined();
  });

  test('renders the Clear button', () => {
    render(<GameBoard />);
    expect(screen.getByRole('button', { name: /clear/i })).toBeDefined();
  });

  test('renders the Import label', () => {
    render(<GameBoard />);
    expect(screen.getByText('Import')).toBeDefined();
  });

  test('renders the generation counter starting at 0', () => {
    render(<GameBoard />);
    expect(screen.getByText(/Generation:/)).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
  });

  test('renders the grid', () => {
    render(<GameBoard />);
    expect(screen.getByRole('grid', { name: 'Game of Life grid' })).toBeDefined();
  });

  test('clicking a cell toggles its state', () => {
    render(<GameBoard />);

    const cells = screen.getAllByRole('gridcell');
    expect(cells[0].getAttribute('aria-label')).toBe('dead');

    fireEvent.click(cells[0]);

    expect(cells[0].getAttribute('aria-label')).toBe('alive');
  });

  test('Clear button resets all cells to dead', () => {
    render(<GameBoard />);

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

  test('renders helper text with keyboard shortcuts', () => {
    render(<GameBoard />);
    expect(screen.getByText(/Click cells to toggle/)).toBeDefined();
    expect(screen.getByText(/Space to play\/pause/)).toBeDefined();
  });

  test('renders play button initially', () => {
    render(<GameBoard />);
    expect(screen.getByRole('button', { name: /play simulation/i })).toBeDefined();
  });

  test('renders undo and redo buttons', () => {
    render(<GameBoard />);
    expect(screen.getByRole('button', { name: /undo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /redo/i })).toBeDefined();
  });

  test('renders step button', () => {
    render(<GameBoard />);
    expect(screen.getByRole('button', { name: /step forward/i })).toBeDefined();
  });

  test('renders max generations slider', () => {
    render(<GameBoard />);
    expect(screen.getByLabelText(/max generations/i)).toBeDefined();
  });
});
