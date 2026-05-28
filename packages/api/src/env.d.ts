declare module "bun:test" {
  export function describe(name: string, fn: () => void): void
  export function test(name: string, fn: () => void | Promise<void>): void
  export function expect(value: unknown): jest.Matchers<unknown>
  export function beforeEach(fn: () => void | Promise<void>): void
  export function afterEach(fn: () => void | Promise<void>): void
  export function beforeAll(fn: () => void | Promise<void>): void
  export function afterAll(fn: () => void | Promise<void>): void
}

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined
  }
}

declare var process: {
  env: NodeJS.ProcessEnv
}
