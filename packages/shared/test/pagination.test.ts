import { describe, test, expect } from "bun:test"
import { paginate } from "../src/utils/pagination"

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }))

  test("returns correct page slice", () => {
    const result = paginate(items, 1, 10)
    expect(result.data).toHaveLength(10)
    expect(result.data[0]).toEqual({ id: 1 })
    expect(result.data[9]).toEqual({ id: 10 })
  })

  test("returns second page", () => {
    const result = paginate(items, 2, 10)
    expect(result.data[0]).toEqual({ id: 11 })
  })

  test("returns partial last page", () => {
    const result = paginate(items, 3, 10)
    expect(result.data).toHaveLength(5)
  })

  test("sets total and totalPages correctly", () => {
    const result = paginate(items, 1, 10)
    expect(result.total).toBe(25)
    expect(result.totalPages).toBe(3)
  })

  test("sets page and pageSize", () => {
    const result = paginate(items, 2, 10)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(10)
  })

  test("returns empty data for out-of-range page", () => {
    const result = paginate(items, 99, 10)
    expect(result.data).toHaveLength(0)
  })

  test("handles empty array", () => {
    const result = paginate([], 1, 10)
    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
  })
})
