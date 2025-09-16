import { describe, it, expect } from 'vitest';
import { stringToColorHex } from '@/lib/color';

describe('stringToColorHex', () => {
  it('returns a hex color string', () => {
    const color = stringToColorHex('Project Alpha');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('is deterministic for the same input', () => {
    const a = stringToColorHex('Same Name');
    const b = stringToColorHex('Same Name');
    expect(a).toBe(b);
  });

  it('varies for different inputs', () => {
    const a = stringToColorHex('Project A');
    const b = stringToColorHex('Project B');
    expect(a).not.toBe(b);
  });
});
