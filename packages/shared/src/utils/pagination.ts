import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * The test in packages/shared/test/pagination.test.ts exercises the full contract.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const safeSize = Number.isFinite(size) ? Math.max(1, Math.floor(size)) : 1
  const total = items.length
  const start = (safePage - 1) * safeSize
  return {
    data: items.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages: Math.ceil(total / safeSize),
  }
}
