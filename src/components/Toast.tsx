import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Slot — asChild 머지 유틸                                             */
/* ------------------------------------------------------------------ */
/* Slot은 단일 자식을 받아 slotProps를 자식 props와 머지합니다.
 *   - 이벤트 핸들러(`on*`): 자식 핸들러 → slot 핸들러 순서로 체이닝.
 *     자식이 e.preventDefault()를 호출하면 slot 핸들러는 건너뜁니다.
 *   - className: 공백으로 concat
 *   - style: 객체 머지(자식이 충돌 시 승리)
 *   - 그 외 attr: 자식 props가 정의되어 있으면 자식이 승리, 아니면 slot 값
 *     (ARIA / data-* / role 은 slot이 기본을 깔되 사용자가 명시적으로 덮어쓸 수 있게 함)
 */
interface SlotProps extends Record<string, unknown> {
  children?: ReactNode;
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps };
  for (const key in childProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];
    if (
      /^on[A-Z]/.test(key) &&
      typeof slotValue === "function" &&
      typeof childValue === "function"
    ) {
      merged[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => unknown)(...args);
        const evt = args[0] as { defaultPrevented?: boolean } | undefined;
        if (!evt?.defaultPrevented) {
          (slotValue as (...a: unknown[]) => unknown)(...args);
        }
      };
    } else if (key === "style") {
      merged[key] = {
        ...(slotValue as object | undefined),
        ...(childValue as object | undefined),
      };
    } else if (key === "className") {
      merged[key] = [slotValue, childValue].filter(Boolean).join(" ");
    } else if (childValue !== undefined) {
      merged[key] = childValue;
    }
  }
  return merged;
}

function Slot({ children, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[FrameUI Toast] `asChild`는 단일 React 엘리먼트 자식이 필요합니다."
      );
    }
    return null;
  }
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  return cloneElement(
    child,
    mergeProps(slotProps, child.props as Record<string, unknown>)
  );
}

export type ToastType = "background" | "foreground";
export type ToastPriority = "high" | "low";

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  duration?: number;
  type?: ToastType;
  priority?: ToastPriority;
  onOpenChange?: (open: boolean) => void;
}

export interface ToastItem {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  duration: number;
  type: ToastType;
  priority: ToastPriority;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ToastContextValue {
  toasts: ToastItem[];
  limit: number;
  label: string;
  add: (input: ToastOptions | ReactNode) => string;
  dismiss: (id?: string) => void;
  update: (id: string, opts: ToastOptions) => void;
  pause: () => void;
  resume: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("Toast components must be used inside <Toast.Provider>");
  }
  return ctx;
}

let toastIdCounter = 0;
function generateId(): string {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}`;
}

function normalizeInput(input: ToastOptions | ReactNode): ToastOptions {
  if (
    input !== null &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    !("$$typeof" in (input as object))
  ) {
    return input as ToastOptions;
  }
  return { title: input as ReactNode };
}

export interface ToastProviderProps {
  children?: ReactNode;
  duration?: number;
  limit?: number;
  label?: string;
}

export function ToastProvider({
  children,
  duration: defaultDuration = 5000,
  limit = 3,
  label = "Notifications",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const timersRef = useRef<
    Map<string, { timeoutId: number; remaining: number; startedAt: number }>
  >(new Map());
  const pausedRef = useRef(false);

  const clearTimer = useCallback((id: string) => {
    const entry = timersRef.current.get(id);
    if (entry) {
      window.clearTimeout(entry.timeoutId);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id?: string) => {
      setToasts((prev) => {
        if (id === undefined) {
          prev.forEach((t) => {
            clearTimer(t.id);
            t.onOpenChange?.(false);
          });
          return [];
        }
        clearTimer(id);
        const target = prev.find((t) => t.id === id);
        target?.onOpenChange?.(false);
        return prev.filter((t) => t.id !== id);
      });
    },
    [clearTimer]
  );

  const scheduleTimer = useCallback(
    (id: string, ms: number) => {
      clearTimer(id);
      if (!Number.isFinite(ms) || ms <= 0) return;
      if (pausedRef.current) {
        timersRef.current.set(id, {
          timeoutId: 0,
          remaining: ms,
          startedAt: 0,
        });
        return;
      }
      const timeoutId = window.setTimeout(() => {
        dismiss(id);
      }, ms);
      timersRef.current.set(id, {
        timeoutId,
        remaining: ms,
        startedAt: Date.now(),
      });
    },
    [clearTimer, dismiss]
  );

  const pause = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    timersRef.current.forEach((entry, id) => {
      if (entry.timeoutId) {
        window.clearTimeout(entry.timeoutId);
        const elapsed = Date.now() - entry.startedAt;
        timersRef.current.set(id, {
          timeoutId: 0,
          remaining: Math.max(0, entry.remaining - elapsed),
          startedAt: 0,
        });
      }
    });
  }, []);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    const entries = Array.from(timersRef.current.entries());
    entries.forEach(([id, entry]) => {
      if (entry.remaining > 0) {
        scheduleTimer(id, entry.remaining);
      }
    });
  }, [scheduleTimer]);

  const add = useCallback(
    (input: ToastOptions | ReactNode): string => {
      const opts = normalizeInput(input);
      const id = opts.id ?? generateId();
      const duration = opts.duration ?? defaultDuration;
      const type = opts.type ?? "background";
      const priority = opts.priority ?? "low";

      setToasts((prev) => {
        const existing = prev.findIndex((t) => t.id === id);
        const next: ToastItem = {
          id,
          duration,
          type,
          priority,
          open: true,
          ...(opts.title !== undefined && { title: opts.title }),
          ...(opts.description !== undefined && { description: opts.description }),
          ...(opts.action !== undefined && { action: opts.action }),
          ...(opts.onOpenChange !== undefined && {
            onOpenChange: opts.onOpenChange,
          }),
        };
        if (existing >= 0) {
          const copy = prev.slice();
          copy[existing] = next;
          return copy;
        }
        return [...prev, next];
      });

      scheduleTimer(id, duration);
      return id;
    },
    [defaultDuration, scheduleTimer]
  );

  const update = useCallback(
    (id: string, opts: ToastOptions) => {
      setToasts((prev) => {
        const idx = prev.findIndex((t) => t.id === id);
        if (idx < 0) return prev;
        const current = prev[idx];
        if (!current) return prev;
        const copy = prev.slice();
        copy[idx] = {
          ...current,
          ...opts,
          id,
          duration: opts.duration ?? current.duration,
          type: opts.type ?? current.type,
          priority: opts.priority ?? current.priority,
          open: true,
        };
        return copy;
      });
      if (opts.duration !== undefined) {
        scheduleTimer(id, opts.duration);
      }
    },
    [scheduleTimer]
  );

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        pause();
      } else {
        resume();
      }
    };
    const onBlur = () => pause();
    const onFocus = () => resume();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [pause, resume]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((entry) => {
        if (entry.timeoutId) window.clearTimeout(entry.timeoutId);
      });
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, limit, label, add, dismiss, update, pause, resume }),
    [toasts, limit, label, add, dismiss, update, pause, resume]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export interface ToastViewportProps extends HTMLAttributes<HTMLOListElement> {
  children?: ReactNode;
}

export function ToastViewport({
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}: ToastViewportProps) {
  const { toasts, limit, label, pause, resume, dismiss } = useToastContext();
  const visible = useMemo(() => {
    const sorted = toasts
      .slice()
      .sort((a, b) =>
        a.priority === b.priority ? 0 : a.priority === "high" ? -1 : 1
      );
    return sorted.slice(0, limit);
  }, [toasts, limit]);

  return (
    <ol
      data-ui="toast-viewport"
      aria-label={label}
      tabIndex={-1}
      onMouseEnter={(e) => {
        pause();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        resume();
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        pause();
        onFocus?.(e);
      }}
      onBlur={(e) => {
        resume();
        onBlur?.(e);
      }}
      {...rest}
    >
      {children
        ? children
        : visible.map((t) => (
            <ToastRoot
              key={t.id}
              priority={t.priority}
              type={t.type}
              title={t.title}
              description={t.description}
              action={t.action}
              onOpenChange={(open) => {
                if (!open) dismiss(t.id);
              }}
            />
          ))}
    </ol>
  );
}

export interface ToastRootProps
  extends Omit<HTMLAttributes<HTMLLIElement>, "title"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: ToastType;
  priority?: ToastPriority;
  duration?: number;
  asChild?: boolean;
  /** Prop 모드: title이 정의되면 내부에서 자동으로 <Toast.Title>을 조립합니다. */
  title?: ReactNode;
  /** Prop 모드: description이 정의되면 내부에서 자동으로 <Toast.Description>을 조립합니다. */
  description?: ReactNode;
  /** Prop 모드: action ReactNode(보통 <Toast.Action>)을 그대로 렌더합니다. */
  action?: ReactNode;
  /**
   * Prop 모드에서 끝에 자동 부착되는 닫기 버튼을 끕니다(기본 false).
   * 사용자가 Close 버튼 모양을 완전히 통제하려면 compound 모드(children)로 전환하세요.
   */
  hideClose?: boolean;
  children?: ReactNode;
}

export function ToastRoot({
  open,
  defaultOpen = true,
  onOpenChange,
  type = "background",
  priority = "low",
  asChild = false,
  title,
  description,
  action,
  hideClose = false,
  children,
  ...props
}: ToastRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : uncontrolledOpen;

  const handleClose = useCallback(() => {
    if (!isControlled) setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  const role = type === "foreground" ? "alertdialog" : "status";
  const ariaLive = type === "foreground" ? "assertive" : "polite";

  const usingPropMode =
    title !== undefined || description !== undefined || action !== undefined;

  if (process.env.NODE_ENV !== "production") {
    if (usingPropMode && children !== undefined) {
      console.warn(
        "[FrameUI Toast] Toast.Root는 title/description/action prop과 children을 동시에 사용할 수 없습니다. " +
          "Prop 모드가 우선 적용되며 children은 무시됩니다."
      );
    }
    if (usingPropMode && asChild) {
      console.warn(
        "[FrameUI Toast] Toast.Root에 asChild와 title/description/action prop을 함께 쓸 수 없습니다. " +
          "asChild가 우선 적용되며 prop은 무시됩니다."
      );
    }
  }

  if (!currentOpen) return null;

  const Comp: ElementType = asChild ? Slot : "li";

  let content: ReactNode;
  if (asChild) {
    content = children;
  } else if (usingPropMode) {
    content = (
      <>
        {title !== undefined && <ToastTitle>{title}</ToastTitle>}
        {description !== undefined && (
          <ToastDescription>{description}</ToastDescription>
        )}
        {action}
        {!hideClose && <ToastClose aria-label="Dismiss" />}
      </>
    );
  } else {
    content = children;
  }

  return (
    <ToastCloseContext.Provider value={handleClose}>
      <Comp
        data-ui="toast-root"
        data-state={currentOpen ? "open" : "closed"}
        data-type={type}
        data-priority={priority}
        role={role}
        aria-live={ariaLive}
        aria-atomic="true"
        {...props}
      >
        {content}
      </Comp>
    </ToastCloseContext.Provider>
  );
}

const ToastCloseContext = createContext<(() => void) | null>(null);

export interface ToastTitleProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ToastTitle({ children, ...props }: ToastTitleProps) {
  return (
    <div data-ui="toast-title" {...props}>
      {children}
    </div>
  );
}

export interface ToastDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function ToastDescription({ children, ...props }: ToastDescriptionProps) {
  return (
    <div data-ui="toast-description" {...props}>
      {children}
    </div>
  );
}

export interface ToastActionProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  altText: string;
  asChild?: boolean;
  children?: ReactNode;
}

export function ToastAction({
  altText,
  asChild = false,
  children,
  onClick,
  ...props
}: ToastActionProps) {
  const close = useContext(ToastCloseContext);
  const Comp: ElementType = asChild ? Slot : "button";
  const buttonOnlyProps = asChild ? {} : { type: "button" as const };
  return (
    <Comp
      {...buttonOnlyProps}
      data-ui="toast-action"
      aria-label={altText}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) close?.();
      }}
      {...props}
    >
      {children ?? altText}
    </Comp>
  );
}

export interface ToastCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: ReactNode;
}

export function ToastClose({
  asChild = false,
  children,
  onClick,
  "aria-label": ariaLabel = "Dismiss",
  ...props
}: ToastCloseProps) {
  const close = useContext(ToastCloseContext);
  const Comp: ElementType = asChild ? Slot : "button";
  const buttonOnlyProps = asChild ? {} : { type: "button" as const };
  return (
    <Comp
      {...buttonOnlyProps}
      data-ui="toast-close"
      aria-label={ariaLabel}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) close?.();
      }}
      {...props}
    >
      {children ?? "×"}
    </Comp>
  );
}

export interface UseToastReturn {
  toast: ((input: ToastOptions | ReactNode) => string) & {
    success: (input: ToastOptions | ReactNode) => string;
    error: (input: ToastOptions | ReactNode) => string;
    dismiss: (id?: string) => void;
    update: (id: string, opts: ToastOptions) => void;
  };
  dismiss: (id?: string) => void;
  update: (id: string, opts: ToastOptions) => void;
}

export function useToast(): UseToastReturn {
  const { add, dismiss, update } = useToastContext();

  return useMemo(() => {
    const toastFn = ((input: ToastOptions | ReactNode) =>
      add(input)) as UseToastReturn["toast"];
    toastFn.success = (input) => {
      const opts = normalizeInput(input);
      return add({ ...opts, type: opts.type ?? "background" });
    };
    toastFn.error = (input) => {
      const opts = normalizeInput(input);
      return add({ ...opts, type: opts.type ?? "foreground" });
    };
    toastFn.dismiss = dismiss;
    toastFn.update = update;
    return { toast: toastFn, dismiss, update };
  }, [add, dismiss, update]);
}

export const Toast = {
  Provider: ToastProvider,
  Viewport: ToastViewport,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  useToast
};