import "@testing-library/jest-dom";

// Suppress console.error and console.warn during tests
// These are expected in error handling tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = () => {};
console.warn = () => {};

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
