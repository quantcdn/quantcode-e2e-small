declare module "bun:test" {
  export function describe(label: string, fn: () => void): void
  export function test(label: string, fn: () => void | Promise<void>): void
  export const it: typeof test
  export function expect(value: unknown): {
    toBe(expected: unknown): void
    toEqual(expected: unknown): void
    toStrictEqual(expected: unknown): void
    toMatchObject(expected: object): void
    toContain(expected: unknown): void
    toHaveLength(expected: number): void
    toBeNull(): void
    toBeUndefined(): void
    toBeDefined(): void
    toBeTruthy(): void
    toBeFalsy(): void
    toBeGreaterThan(expected: number): void
    toBeGreaterThanOrEqual(expected: number): void
    toBeLessThan(expected: number): void
    toBeLessThanOrEqual(expected: number): void
    toThrow(expected?: string | RegExp | Error): void
    resolves: ReturnType<typeof expect>
    rejects: ReturnType<typeof expect>
    not: ReturnType<typeof expect>
  }
  export function beforeAll(fn: () => void | Promise<void>): void
  export function afterAll(fn: () => void | Promise<void>): void
  export function beforeEach(fn: () => void | Promise<void>): void
  export function afterEach(fn: () => void | Promise<void>): void
}

declare var process: {
  env: Record<string, string | undefined>
}
