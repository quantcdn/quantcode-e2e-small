import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 * The test in packages/shared/test/pagination.test.ts exercises the full contract.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const start = (page - 1) * size
  return {
    data: items.slice(Math.max(start, 0), Math.max(start, 0) + size),
    page,
    pageSize: size,
    total,
    totalPages: Math.ceil(total / size),
  }
}
