import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * Inputs are clamped so the returned metadata is always internally consistent:
 * a non-positive, fractional or non-finite `size` becomes 0 (empty `data`), and
 * `page` is floored to a minimum of 1. The response reports the clamped values.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const pageSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 0
  const currentPage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1

  const total = items.length
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
  const start = (currentPage - 1) * pageSize
  const data = pageSize > 0 && start < total ? items.slice(start, start + pageSize) : []

  return { data, page: currentPage, pageSize, total, totalPages }
}
