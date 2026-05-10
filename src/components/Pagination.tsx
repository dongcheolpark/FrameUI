import React, { useCallback, useMemo, useState, createContext, useContext } from "react";
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type PaginationEntry =
  | { type: "page"; value: number }
  | { type: "ellipsis"; key: string };

export interface PaginationContextValue {
  page: number;
  totalPages: number;
  pages: PaginationEntry[];
  onPageChange: (page: number) => void;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
}

export interface PaginationRootProps
  extends Omit<HTMLAttributes<HTMLElement>, "defaultValue" | "onChange"> {
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  totalPages: number;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  "aria-label"?: string;
  children?: ReactNode;
}

export interface PaginationListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

export interface PaginationItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: number;
}

export interface PaginationEllipsisProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface PaginationNavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const PaginationContext = createContext<PaginationContextValue | null>(null);

export function usePaginationContext(): PaginationContextValue {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error("Pagination components must be used within a Pagination.Root");
  }
  return context;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

export function buildPaginationEntries(
  page: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationEntry[] {
  if (totalPages <= 0) return [];

  const safeBoundary = Math.max(0, Math.floor(boundaryCount));
  const safeSibling = Math.max(0, Math.floor(siblingCount));

  const startPages = range(1, Math.min(safeBoundary, totalPages));
  const endPages = range(
    Math.max(totalPages - safeBoundary + 1, safeBoundary + 1),
    totalPages,
  );

  const siblingsStart = Math.max(
    Math.min(page - safeSibling, totalPages - safeBoundary - safeSibling * 2 - 1),
    safeBoundary + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + safeSibling, safeBoundary + safeSibling * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : totalPages - 1,
  );

  const items: PaginationEntry[] = [];
  const seen = new Set<number>();

  const pushPage = (value: number) => {
    if (value < 1 || value > totalPages) return;
    if (seen.has(value)) return;
    seen.add(value);
    items.push({ type: "page", value });
  };

  for (const value of startPages) pushPage(value);

  if (siblingsStart > safeBoundary + 2) {
    items.push({ type: "ellipsis", key: "ellipsis-start" });
  } else if (safeBoundary + 1 < totalPages - safeBoundary) {
    pushPage(safeBoundary + 1);
  }

  for (const value of range(siblingsStart, siblingsEnd)) pushPage(value);

  if (siblingsEnd < totalPages - safeBoundary - 1) {
    items.push({ type: "ellipsis", key: "ellipsis-end" });
  } else if (totalPages - safeBoundary > safeBoundary) {
    pushPage(totalPages - safeBoundary);
  }

  for (const value of endPages) pushPage(value);

  return items;
}

export function PaginationRoot({
  page,
  defaultPage = 1,
  onPageChange,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  "aria-label": ariaLabel = "Pagination",
  children,
  className,
  ref,
  ...props
}: PaginationRootProps & { ref?: React.Ref<HTMLElement> }) {
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const isControlled = page !== undefined;

  const safeTotal = Math.max(0, Math.floor(totalPages));
  const rawPage = isControlled ? page : uncontrolledPage;
  const currentPage = safeTotal === 0 ? 0 : Math.min(Math.max(1, rawPage), safeTotal);

  const handlePageChange = useCallback(
    (next: number) => {
      if (disabled) return;
      if (safeTotal <= 0) return;
      const clamped = Math.min(Math.max(1, Math.floor(next)), safeTotal);
      if (clamped === currentPage) return;
      if (!isControlled) {
        setUncontrolledPage(clamped);
      }
      onPageChange?.(clamped);
    },
    [currentPage, disabled, isControlled, onPageChange, safeTotal],
  );

  const pages = useMemo(
    () => buildPaginationEntries(currentPage, safeTotal, siblingCount, boundaryCount),
    [boundaryCount, currentPage, safeTotal, siblingCount],
  );

  const isFirst = safeTotal <= 1 || currentPage <= 1;
  const isLast = safeTotal <= 1 || currentPage >= safeTotal;

  const contextValue = useMemo<PaginationContextValue>(
    () => ({
      page: currentPage,
      totalPages: safeTotal,
      pages,
      onPageChange: handlePageChange,
      isFirst,
      isLast,
      disabled,
    }),
    [currentPage, disabled, handlePageChange, isFirst, isLast, pages, safeTotal],
  );

  return (
    <PaginationContext.Provider value={contextValue}>
      <nav
        ref={ref}
        aria-label={ariaLabel}
        data-ui="pagination"
        data-disabled={disabled ? "" : undefined}
        className={className}
        {...props}
      >
        {children}
      </nav>
    </PaginationContext.Provider>
  );
}

export function PaginationList({
  children,
  className,
  ref,
  ...props
}: PaginationListProps & { ref?: React.Ref<HTMLUListElement> }) {
  const { pages } = usePaginationContext();

  const content =
    children ??
    pages.map((entry) =>
      entry.type === "page" ? (
        <li key={`page-${entry.value}`} data-ui="pagination-list-item">
          <PaginationItem value={entry.value}>{entry.value}</PaginationItem>
        </li>
      ) : (
        <li key={entry.key} data-ui="pagination-list-item" aria-hidden="true">
          <PaginationEllipsis />
        </li>
      )
    );

  return (
    <ul ref={ref} data-ui="pagination-list" className={className} {...props}>
      {content}
    </ul>
  );
}

export function PaginationItem({
  value,
  onClick,
  children,
  disabled: itemDisabled,
  className,
  ref,
  ...props
}: PaginationItemProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { page, onPageChange, disabled, totalPages } = usePaginationContext();
  const isActive = value === page;
  const outOfRange = value < 1 || value > totalPages;
  const isDisabled = disabled || itemDisabled || outOfRange;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) return;
    onPageChange(value);
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-current={isActive ? "page" : undefined}
      aria-disabled={isDisabled ? "true" : undefined}
      data-ui="pagination-item"
      data-state={isActive ? "active" : "inactive"}
      data-disabled={isDisabled ? "" : undefined}
      data-value={value}
      disabled={isDisabled}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children ?? value}
    </button>
  );
}

export function PaginationEllipsis({
  children,
  className,
  ref,
  ...props
}: PaginationEllipsisProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-ui="pagination-ellipsis"
      className={className}
      {...props}
    >
      {children ?? "…"}
    </span>
  );
}

function makeNavButton(
  ui: "pagination-prev" | "pagination-next" | "pagination-first" | "pagination-last",
  defaultLabel: string,
  resolveTarget: (ctx: PaginationContextValue) => number,
  resolveBoundary: (ctx: PaginationContextValue) => boolean,
) {
  return function NavButton({
    onClick,
    children,
    disabled: propDisabled,
    "aria-label": ariaLabel,
    className,
    ref,
    ...props
  }: PaginationNavButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
    const ctx = usePaginationContext();
    const atBoundary = resolveBoundary(ctx);
    const isDisabled = ctx.disabled || propDisabled || atBoundary;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;
      ctx.onPageChange(resolveTarget(ctx));
    };

    const hasTextChildren =
      typeof children === "string" || typeof children === "number";
    const resolvedAriaLabel = ariaLabel ?? (hasTextChildren ? undefined : defaultLabel);

    return (
      <button
        ref={ref}
        type="button"
        aria-label={resolvedAriaLabel}
        aria-disabled={isDisabled ? "true" : undefined}
        data-ui={ui}
        data-disabled={isDisabled ? "" : undefined}
        disabled={isDisabled}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  };
}

export const PaginationPrev = makeNavButton(
  "pagination-prev",
  "Previous page",
  (ctx) => ctx.page - 1,
  (ctx) => ctx.isFirst,
);

export const PaginationNext = makeNavButton(
  "pagination-next",
  "Next page",
  (ctx) => ctx.page + 1,
  (ctx) => ctx.isLast,
);

export const PaginationFirst = makeNavButton(
  "pagination-first",
  "First page",
  () => 1,
  (ctx) => ctx.isFirst,
);

export const PaginationLast = makeNavButton(
  "pagination-last",
  "Last page",
  (ctx) => ctx.totalPages,
  (ctx) => ctx.isLast,
);

export const Pagination = Object.assign(
  function Pagination(props: PaginationRootProps & { ref?: React.Ref<HTMLElement> }) {
    return <PaginationRoot {...props} />;
  },
  {
    Root: PaginationRoot,
    List: PaginationList,
    Item: PaginationItem,
    Ellipsis: PaginationEllipsis,
    Prev: PaginationPrev,
    Next: PaginationNext,
    First: PaginationFirst,
    Last: PaginationLast,
  },
);
