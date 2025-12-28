import { render, screen, fireEvent } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  test('renders correct number of cells', () => {
    const grid = [
      [false, false, false],
      [false, false, false],
    ];
    const toggleCell = jest.fn();

    render(<Grid grid={grid} toggleCell={toggleCell} />);

    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBe(6); // 2 rows x 3 cols
  });

  test('renders with correct aria-label on container', () => {
    const grid = [[false]];
    render(<Grid grid={grid} toggleCell={() => {}} />);

    expect(screen.getByRole('grid', { name: 'Game of Life grid' })).toBeDefined();
  });

  test('calls toggleCell with correct coordinates when cell is clicked', () => {
    const grid = [
      [false, false],
      [false, false],
    ];
    const toggleCell = jest.fn();

    render(<Grid grid={grid} toggleCell={toggleCell} />);

    const cells = screen.getAllByRole('gridcell');
    // Click the cell at row 1, col 0 (index 2 in flat array)
    fireEvent.click(cells[2]);

    expect(toggleCell).toHaveBeenCalledWith(1, 0);
  });

  test('renders cells with correct alive/dead state', () => {
    const grid = [
      [true, false],
      [false, true],
    ];

    render(<Grid grid={grid} toggleCell={() => {}} />);

    const cells = screen.getAllByRole('gridcell');
    expect(cells[0].getAttribute('aria-label')).toBe('alive');
    expect(cells[1].getAttribute('aria-label')).toBe('dead');
    expect(cells[2].getAttribute('aria-label')).toBe('dead');
    expect(cells[3].getAttribute('aria-label')).toBe('alive');
  });

  test('handles empty grid gracefully', () => {
    const grid: boolean[][] = [];

    render(<Grid grid={grid} toggleCell={() => {}} />);

    const cells = screen.queryAllByRole('gridcell');
    expect(cells.length).toBe(0);
  });
});
