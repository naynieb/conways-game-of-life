import { render, screen, fireEvent } from '@testing-library/react';
import { Cell } from './Cell';

describe('Cell', () => {
  test('renders with aria-label "alive" when alive is true', () => {
    render(<Cell alive={true} onClick={() => {}} />);
    expect(screen.getByRole('gridcell', { name: 'alive' })).toBeDefined();
  });

  test('renders with aria-label "dead" when alive is false', () => {
    render(<Cell alive={false} onClick={() => {}} />);
    expect(screen.getByRole('gridcell', { name: 'dead' })).toBeDefined();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Cell alive={false} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('gridcell'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('has correct role attribute', () => {
    render(<Cell alive={false} onClick={() => {}} />);
    expect(screen.getByRole('gridcell')).toBeDefined();
  });
});

