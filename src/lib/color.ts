/**
 * Generate a pleasant, deterministic hex color for a given string.
 * Uses a simple hash -> HSL mapping, then converts to HEX.
 */
export const stringToColorHex = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // 32-bit
  }

  const hue = Math.abs(hash) % 360; // 0..359
  const saturation = 70; // percent
  const lightness = 45; // percent

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x: number) =>
      Math.round(255 * x)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  };

  return hslToHex(hue, saturation, lightness);
};

export default stringToColorHex;
