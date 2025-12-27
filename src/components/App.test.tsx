import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders hello", () => {
  render(<App />);
  expect(screen.getByText(/Nortal/i)).toBeDefined();
});
