import { useState } from "react";

export const PAGE_SIZE = 15;

export function usePaginated<T>(data: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const p = Math.min(page, totalPages);
  const items = data.slice((p - 1) * pageSize, p * pageSize);
  return { page: p, setPage, totalPages, items };
}
