import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 *
 * TODO: implement this function — it is currently a stub.
 * The test in packages/shared/test/pagination.test.ts exercises the full contract.
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const normalise = (n: number) => (Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1)
  const safePage = normalise(page)
  const safeSize = normalise(size)
  const total = items.length
  const start = (safePage - 1) * safeSize
  const data = items.slice(start, start + safeSize)
  return { data, page: safePage, pageSize: safeSize, total, totalPages: Math.ceil(total / safeSize) }
}
