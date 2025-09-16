/**
 * Creates an object with only truthy values, filtering out falsy entries
 * @param entries Array of [key, value] tuples
 * @returns Object with only truthy values
 */
export const createTruthyObject = <T extends Record<string, unknown>>(
  entries: Array<[keyof T, unknown]>
): Partial<T> => {
  return Object.fromEntries(
    entries.filter(([, value]) => Boolean(value))
  ) as Partial<T>;
};

/**
 * Creates an object with conditional entries using spread syntax
 * @param conditions Array of [condition, object] tuples
 * @returns Merged object with only truthy conditions
 */
export const createConditionalObject = <T extends Record<string, unknown>>(
  conditions: Array<[boolean, Partial<T>]>
): Partial<T> => {
  return Object.assign(
    {},
    ...conditions.filter(([condition]) => condition).map(([, obj]) => obj)
  );
};

/**
 * Helper to create conditional object entries for spread syntax
 * @param condition Boolean condition
 * @param obj Object to include if condition is true
 * @returns Object or empty object
 */
export const when = <T extends Record<string, unknown>>(
  condition: boolean,
  obj: T
): T | Record<string, never> => (condition ? obj : {});

/**
 * Type-safe filter builder that only includes truthy values
 * @param values Object with potential filter values
 * @param mapper Function that maps values to filter object
 * @returns Filtered object with only truthy values
 */
export const buildFilterPayload = <
  TInput,
  TOutput extends Record<string, unknown>,
>(
  values: TInput,
  mapper: (values: TInput) => Partial<TOutput>
): Partial<TOutput> => {
  const mapped = mapper(values);
  return Object.fromEntries(
    Object.entries(mapped).filter(([, value]) => Boolean(value))
  ) as Partial<TOutput>;
};

/**
 * Creates a payload by conditionally including properties only when they have truthy values
 * @param conditions Array of [condition, key, value] tuples
 * @returns Object with only truthy conditions
 */
export const createPayload = <T extends Record<string, unknown>>(
  conditions: Array<[boolean, keyof T, T[keyof T]]>
): Partial<T> => {
  const result: Record<string, unknown> = {};

  for (const [condition, key, value] of conditions) {
    if (condition && value !== undefined && value !== null && value !== '') {
      result[key as string] = value;
    }
  }

  return result as Partial<T>;
};
