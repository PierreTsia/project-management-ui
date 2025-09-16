import { describe, it, expect } from 'vitest';
import { createTruthyObject } from '@/lib/object-utils';

type TestShape = {
  a: string;
  b: number;
  c: boolean;
  d: string | null | undefined;
  e: unknown;
  f: unknown;
  g: unknown;
};

describe('createTruthyObject', () => {
  it('filters out falsy values ("", 0, false, null, undefined)', () => {
    const entries: Array<[keyof TestShape, unknown]> = [
      ['a', ''],
      ['b', 0],
      ['c', false],
      ['d', null],
      ['e', undefined],
      ['f', 'ok'],
    ];

    const result = createTruthyObject<TestShape>(entries);

    expect(result).toEqual({ f: 'ok' });
    expect('a' in result).toBe(false);
    expect('b' in result).toBe(false);
    expect('c' in result).toBe(false);
    expect('d' in result).toBe(false);
    expect('e' in result).toBe(false);
  });

  it('keeps truthy values including objects, arrays, non-empty strings, non-zero numbers', () => {
    const obj = { x: 1 };
    const arr: unknown[] = [];
    const entries: Array<[keyof TestShape, unknown]> = [
      ['a', 'hello'],
      ['b', 123],
      ['c', true],
      ['d', obj],
      ['e', arr],
    ];

    const result = createTruthyObject<TestShape>(entries);

    expect(result).toMatchObject({
      a: 'hello',
      b: 123,
      c: true,
      d: obj,
      e: arr,
    });
  });

  it('returns an empty object when all values are falsy', () => {
    const entries: Array<[keyof TestShape, unknown]> = [
      ['a', ''],
      ['b', 0],
      ['c', false],
      ['d', undefined],
    ];

    const result = createTruthyObject<TestShape>(entries);
    expect(result).toEqual({});
  });

  it('treats whitespace-only strings as truthy (by design)', () => {
    const entries: Array<[keyof TestShape, unknown]> = [['g', ' ']];
    const result = createTruthyObject<TestShape>(entries);
    expect(result).toEqual({ g: ' ' });
  });
});
