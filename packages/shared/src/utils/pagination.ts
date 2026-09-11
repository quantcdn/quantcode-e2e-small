import type { PaginatedResponse } from "../types"

/**
 * Paginate an array of items.
 *
 * Inputs are clamped before any index math: a page below 1 is treated as 1 and
 * a size below 1 is treated as 1. Without this, negative or zero values yield
 * silently-wrong windows (a negative start index slices from the end of the
 * array, and a zero size divides by zero when computing totalPages). The
 * clamped values are the ones reported back, so the response always describes
 * the window that was actually returned.
 *
 * @param items  Full array of items
 * @param page   1-indexed page number (values below 1 are treated as 1)
 * @param size   Number of items per page (values below 1 are treated as 1)
 */
export function paginate<T>(items: T[], page: number, size: number): PaginatedResponse<T> {
  const effectivePage = Math.max(1, page)
  const effectiveSize = Math.max(1, size)

  const total = items.length
  const totalPages = Math.ceil(total / effectiveSize)
  const start = (effectivePage - 1) * effectiveSize

  return {
    data: items.slice(start, start + effectiveSize),
    page: effectivePage,
    pageSize: effectiveSize,
    total,
    totalPages,
  }
}
