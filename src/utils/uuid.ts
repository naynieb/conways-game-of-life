/**
 * Generate a UUID v4 string.
 * 
 * @returns A random UUID in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 
 * @example
 * ```ts
 * const id = generateUUID();
 * // => "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * ```
 */
export function generateUUID(): string {
  // Prefer native implementation
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Helper to get secure/unsafe random bytes
  const random = (len: number) => {
    try {
      return Array.from(crypto.getRandomValues(new Uint8Array(len)));
    } catch {
      return Array.from({ length: len }, () => Math.random() * 256 | 0);
    }
  };

  const bytes = random(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

  const hex = bytes.map(b => b.toString(16).padStart(2, "0")).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
