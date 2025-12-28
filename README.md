# Conway's Game of Life

A React + TypeScript implementation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), a cellular automaton devised by mathematician John Conway in 1970.

## Table of Contents

- [Problem Description](#problem-description)
- [Features](#features)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Assumptions](#assumptions)
- [Trade-offs](#trade-offs)
- [Edge Cases Handled](#edge-cases-handled)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Problem Description

Conway's Game of Life is a zero-player game that simulates cellular evolution on a 2D grid. Each cell can be either **alive** or **dead**, and the state of each cell in the next generation is determined by its current state and the number of live neighbors.

### Rules

1. **Underpopulation**: Any live cell with fewer than 2 live neighbors dies
2. **Survival**: Any live cell with 2 or 3 live neighbors survives
3. **Overpopulation**: Any live cell with more than 3 live neighbors dies
4. **Reproduction**: Any dead cell with exactly 3 live neighbors becomes alive

---

## Features

- **Interactive Grid**: Click cells to toggle their state (alive/dead)
- **Simulation Controls**: Play, pause, and step through generations
- **Time Travel**: Undo/redo to navigate through generation history
- **Import Patterns**: Load patterns from JSON files
- **Auto-Detection**: Automatically detects extinction, stable patterns, and generation limits
- **Configurable Limits**: Adjust maximum generations via slider
- **Responsive UI**: Modern dark theme with visual feedback

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

### Linting

```bash
npm run lint
```

---

## Architecture

```
src/
├── components/          # React UI components
│   ├── App.tsx          # Root application component
│   ├── GameBoard.tsx    # Main game container with controls
│   ├── Grid.tsx         # Grid renderer
│   └── Cell.tsx         # Individual cell
├── hooks/
│   └── useGameOfLife.ts # Core game state management hook
├── types/
│   └── game.ts          # Type definitions and pure game logic
├── config/
│   └── gameConfig.ts    # Centralized configuration constants
└── utils/
    └── validation.ts    # Input validation utilities
```

### Design Decisions

1. **Separation of Concerns**: Pure game logic lives in `types/game.ts`, separate from React state management in `useGameOfLife.ts`

2. **Immutable State**: All grid operations create new arrays rather than mutating existing ones, ensuring predictable React updates

3. **History as State**: Full generation history is stored to enable time-travel (undo/redo), with configurable limits to prevent memory issues

4. **Memoized Cells**: Individual `Cell` components are wrapped in `React.memo` to prevent unnecessary re-renders

---

## Assumptions

1. **Finite Grid**: The grid has fixed dimensions; cells at edges have fewer neighbors (no toroidal wrapping)

2. **Grid Size Limits**: Maximum grid size is 100x100 cells to maintain performance in the browser

3. **History Retention**: Up to 500 generations of history are retained; older states are discarded

4. **Interval Precision**: The simulation interval uses `setInterval`, which may drift slightly under heavy CPU load

5. **Browser Environment**: The application is designed for modern browsers with ES2020+ support

6. **JSON Import Format**: Imported patterns must be valid JSON arrays of boolean/numeric (0/1) 2D arrays

---

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Store full history | Enables undo/redo | Higher memory usage |
| Boolean 2D arrays | Simple, readable code | Less memory-efficient than typed arrays |
| Re-render entire grid | Simpler implementation | Less efficient than diff-based updates |
| Finite bounded grid | Predictable behavior | Patterns may interact with edges |
| Client-side only | No server required | Cannot persist state across sessions |

---

## Edge Cases Handled

### Extinction Detection
When all cells die, the simulation stops and displays an "extinction" message.

### Stable Pattern Detection
When consecutive generations are identical (e.g., a "block" pattern), the simulation stops and displays a "stable" message.

### Generation Limit
Configurable maximum generation limit (default: 1000) prevents infinite loops for oscillating patterns.

### Empty Grid
Stepping on an empty grid correctly produces another empty grid.

### Import Validation
- Invalid JSON files display a user-friendly error
- Non-array data is rejected
- Grids exceeding maximum dimensions are rejected with guidance

---

## Testing

The test suite covers:

- **Unit Tests**: Core game logic (neighbor counting, next generation computation)
- **Hook Tests**: State management, actions, and edge cases
- **Component Tests**: Rendering, user interactions, accessibility

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/types/game.test.ts
```

---

## Deployment

### Docker

```bash
# Build the image
docker build -t conways-game-of-life .

# Run the container
docker run -p 8080:80 conways-game-of-life
```

The application will be available at `http://localhost:8080`

### Static Hosting

The `dist/` folder after `npm run build` can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, S3, etc.).

---

## Tech Stack

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Jest** - Testing framework
- **Testing Library** - Component testing utilities

---

## License

MIT
