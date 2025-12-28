import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

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

test("renders game title", async () => {
  render(<App />);
  // Wait for async storage hook to complete
  await waitFor(() => {});
  expect(screen.getByText(/Conway's Game of Life/i)).toBeDefined();
});
