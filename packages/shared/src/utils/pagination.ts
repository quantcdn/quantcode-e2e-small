import type { PaginatedResponse } from "../types"

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

function clamp(value: number, fallback: number, max: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(1, Math.floor(value)))
}

/**
 * Paginate an array of items.
 *
 * Non-finite or out-of-range inputs are clamped rather than propagated, so the
 * response envelope never contains NaN or Infinity.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number
 * @param size   Number of items per page
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const total = items.length
  const pageSize = clamp(size, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
  const currentPage = clamp(page, 1, Number.MAX_SAFE_INTEGER)
  const totalPages = Math.ceil(total / pageSize)
  const start = (currentPage - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
