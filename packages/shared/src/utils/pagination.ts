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
  const total = items.length
  const totalPages = size > 0 ? Math.ceil(total / size) : 0
  const start = (page - 1) * size
  const data = start >= 0 && start < total ? items.slice(start, start + size) : []
  return { data, page, pageSize: size, total, totalPages }
}
