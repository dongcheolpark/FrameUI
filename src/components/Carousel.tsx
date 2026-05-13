import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

// --- Types ---
export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselAutoplay = boolean | { interval: number };

export interface CarouselRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  orientation?: CarouselOrientation;
  loop?: boolean;
  autoplay?: CarouselAutoplay;
  pauseOnHover?: boolean;
  children?: ReactNode;
}

export interface CarouselViewportProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CarouselTrackProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CarouselPrevTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface CarouselNextTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface CarouselIndicatorProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  index: number;
}

// --- Context ---
interface CarouselContextValue {
  currentIndex: number;
  total: number;
  orientation: CarouselOrientation;
  loop: boolean;
  autoplayActive: boolean;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  registerSlide: (node: HTMLElement) => () => void;
  getSlideIndex: (node: HTMLElement) => number;
  resetAutoplay: () => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarouselContext() {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error("Carousel components must be used within a Carousel.Root");
  }
  return ctx;
}

const DEFAULT_AUTOPLAY_INTERVAL = 5000;
const DRAG_THRESHOLD_RATIO = 0.15;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function wrap(n: number, total: number) {
  if (total <= 0) return 0;
  return ((n % total) + total) % total;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduce(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    mq.addListener(listener);
    return () => mq.removeListener(listener);
  }, []);
  return reduce;
}

// --- Root ---
export function CarouselRoot({
  index,
  defaultIndex = 0,
  onIndexChange,
  orientation = "horizontal",
  loop = false,
  autoplay = false,
  pauseOnHover = true,
  children,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  className,
  ref,
  ...props
}: CarouselRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const isControlled = index !== undefined;
  const currentIndex = isControlled ? index : uncontrolledIndex;

  // Slides are tracked by their DOM node so indices always reflect DOM order.
  const slideNodesRef = useRef<HTMLElement[]>([]);
  const [total, setTotal] = useState(0);

  const registerSlide = useCallback((node: HTMLElement) => {
    slideNodesRef.current = [...slideNodesRef.current, node];
    setTotal(slideNodesRef.current.length);
    return () => {
      slideNodesRef.current = slideNodesRef.current.filter((n) => n !== node);
      setTotal(slideNodesRef.current.length);
    };
  }, []);

  const getSlideIndex = useCallback((node: HTMLElement) => {
    // Sort by document order so indices are reliable regardless of mount order.
    const nodes = slideNodesRef.current;
    const sorted = [...nodes].sort((a, b) => {
      if (a === b) return 0;
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return sorted.indexOf(node);
  }, []);

  const autoplayEnabled = autoplay !== false && autoplay !== undefined;
  const autoplayInterval =
    typeof autoplay === "object" && autoplay !== null
      ? autoplay.interval
      : DEFAULT_AUTOPLAY_INTERVAL;

  const prefersReducedMotion = usePrefersReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDocVisible, setIsDocVisible] = useState(() =>
    typeof document === "undefined" ? true : !document.hidden
  );

  const autoplayPaused =
    prefersReducedMotion ||
    !isVisible ||
    !isDocVisible ||
    (pauseOnHover && (isHovered || isFocused));

  const autoplayActive = autoplayEnabled && !autoplayPaused;

  const emitIndex = useCallback(
    (next: number) => {
      if (!isControlled) {
        setUncontrolledIndex(next);
      }
      onIndexChange?.(next);
    },
    [isControlled, onIndexChange]
  );

  const goTo = useCallback(
    (target: number) => {
      const count = slideNodesRef.current.length;
      if (count <= 0) return;
      const nextIdx = loop
        ? wrap(target, count)
        : clamp(target, 0, count - 1);
      if (nextIdx === currentIndex) return;
      emitIndex(nextIdx);
    },
    [currentIndex, emitIndex, loop]
  );

  const next = useCallback(() => {
    const count = slideNodesRef.current.length;
    if (count <= 0) return;
    if (!loop && currentIndex >= count - 1) return;
    const n = loop ? wrap(currentIndex + 1, count) : currentIndex + 1;
    emitIndex(n);
  }, [currentIndex, emitIndex, loop]);

  const prev = useCallback(() => {
    const count = slideNodesRef.current.length;
    if (count <= 0) return;
    if (!loop && currentIndex <= 0) return;
    const p = loop ? wrap(currentIndex - 1, count) : currentIndex - 1;
    emitIndex(p);
  }, [currentIndex, emitIndex, loop]);

  const autoplayTickRef = useRef(0);
  const resetAutoplay = useCallback(() => {
    autoplayTickRef.current += 1;
  }, []);

  // Autoplay timer.
  useEffect(() => {
    if (!autoplayActive || total <= 1) return;
    const tickAtStart = autoplayTickRef.current;
    const id = window.setInterval(() => {
      if (autoplayTickRef.current !== tickAtStart) return;
      // use functional style via closure over current index; we rely on the
      // effect re-running when currentIndex changes.
      const count = slideNodesRef.current.length;
      if (count <= 0) return;
      if (!loop && currentIndex >= count - 1) {
        return;
      }
      const n = loop ? wrap(currentIndex + 1, count) : currentIndex + 1;
      if (!isControlled) {
        setUncontrolledIndex(n);
      }
      onIndexChange?.(n);
    }, autoplayInterval);
    return () => window.clearInterval(id);
  }, [
    autoplayActive,
    autoplayInterval,
    currentIndex,
    isControlled,
    loop,
    onIndexChange,
    total,
  ]);

  // visibilitychange listener.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => setIsDocVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  const rootRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver for visibility of the root element.
  useEffect(() => {
    if (!autoplayEnabled) return;
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplayEnabled]);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref && "current" in ref) {
        (ref as { current: HTMLDivElement | null }).current = node;
      }
    },
    [ref]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        next();
        resetAutoplay();
        break;
      case prevKey:
        event.preventDefault();
        prev();
        resetAutoplay();
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        resetAutoplay();
        break;
      case "End": {
        event.preventDefault();
        const count = slideNodesRef.current.length;
        if (count > 0) goTo(count - 1);
        resetAutoplay();
        break;
      }
      default:
        return;
    }
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(event);
    setIsHovered(true);
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    setIsHovered(false);
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    setIsFocused(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  const contextValue = useMemo<CarouselContextValue>(
    () => ({
      currentIndex,
      total,
      orientation,
      loop,
      autoplayActive,
      goTo,
      next,
      prev,
      registerSlide,
      getSlideIndex,
      resetAutoplay,
    }),
    [
      autoplayActive,
      currentIndex,
      getSlideIndex,
      goTo,
      loop,
      next,
      orientation,
      prev,
      registerSlide,
      resetAutoplay,
      total,
    ]
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={setRef}
        data-ui="carousel"
        data-orientation={orientation}
        aria-roledescription="carousel"
        className={className}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

// --- Viewport ---
export function CarouselViewport({
  children,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ref,
  ...props
}: CarouselViewportProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { orientation, next, prev, resetAutoplay } = useCarouselContext();

  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
    active: boolean;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      active: true,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignored: some envs (happy-dom) may not support pointer capture.
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const s = dragState.current;
    if (!s || s.pointerId !== event.pointerId) return;
    if (!isDragging) {
      const dx = Math.abs(event.clientX - s.startX);
      const dy = Math.abs(event.clientY - s.startY);
      if (dx > 4 || dy > 4) setIsDragging(true);
    }
  };

  const endDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    commit: boolean
  ) => {
    const s = dragState.current;
    if (!s || s.pointerId !== event.pointerId) return;
    dragState.current = null;
    setIsDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignored
    }

    if (!commit) return;

    const deltaX = event.clientX - s.startX;
    const deltaY = event.clientY - s.startY;
    const isHorizontal = orientation === "horizontal";
    const delta = isHorizontal ? deltaX : deltaY;
    const size = isHorizontal ? s.width : s.height;
    if (!size) return;

    if (Math.abs(delta) / size >= DRAG_THRESHOLD_RATIO) {
      if (delta < 0) next();
      else prev();
      resetAutoplay();
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    endDrag(event, true);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerCancel?.(event);
    endDrag(event, false);
  };

  const touchAction = orientation === "horizontal" ? "pan-y" : "pan-x";

  const viewportStyle: CSSProperties = {
    overflow: "hidden",
    touchAction,
    ...style,
  };

  return (
    <div
      ref={ref}
      data-ui="carousel-viewport"
      data-orientation={orientation}
      data-dragging={isDragging ? "" : undefined}
      style={viewportStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...props}
    >
      {children}
    </div>
  );
}

// --- Track ---
export function CarouselTrack({
  children,
  style,
  ref,
  ...props
}: CarouselTrackProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { orientation, autoplayActive } = useCarouselContext();

  const trackStyle: CSSProperties = {
    display: "flex",
    flexDirection: orientation === "horizontal" ? "row" : "column",
    userSelect: "none",
    ...style,
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-live={autoplayActive ? "off" : "polite"}
      data-ui="carousel-track"
      data-orientation={orientation}
      style={trackStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// --- Slide ---
export function CarouselSlide({
  children,
  style,
  ref,
  ...props
}: CarouselSlideProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { registerSlide, getSlideIndex, currentIndex, total } =
    useCarouselContext();

  const localRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const node = localRef.current;
    if (!node) return;
    return registerSlide(node);
  }, [registerSlide]);

  const myIndex = localRef.current ? getSlideIndex(localRef.current) : -1;
  const isActive = myIndex === currentIndex;
  const label = myIndex >= 0 && total > 0 ? `${myIndex + 1} of ${total}` : undefined;

  const slideStyle: CSSProperties = {
    flex: "0 0 100%",
    ...style,
  };

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref && "current" in ref) {
        (ref as { current: HTMLDivElement | null }).current = node;
      }
    },
    [ref]
  );

  return (
    <div
      ref={setRef}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!isActive || undefined}
      // `inert` is a standard HTML attribute as of React 19.
      inert={!isActive}
      data-ui="carousel-slide"
      data-state={isActive ? "active" : "inactive"}
      style={slideStyle}
      {...props}
    >
      {children}
    </div>
  );
}

// --- PrevTrigger ---
export function CarouselPrevTrigger({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel = "Previous slide",
  ref,
  ...props
}: CarouselPrevTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { currentIndex, loop, prev, resetAutoplay } = useCarouselContext();
  const atStart = !loop && currentIndex <= 0;
  const isDisabled = disabled || atStart;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) return;
    prev();
    resetAutoplay();
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      data-ui="carousel-prev"
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// --- NextTrigger ---
export function CarouselNextTrigger({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel = "Next slide",
  ref,
  ...props
}: CarouselNextTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { currentIndex, total, loop, next, resetAutoplay } =
    useCarouselContext();
  const atEnd = !loop && total > 0 && currentIndex >= total - 1;
  const isDisabled = disabled || atEnd;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) return;
    next();
    resetAutoplay();
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      data-ui="carousel-next"
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// --- Indicator ---
export function CarouselIndicator({
  index,
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
  ref,
  ...props
}: CarouselIndicatorProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { currentIndex, goTo, resetAutoplay } = useCarouselContext();
  const isActive = currentIndex === index;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    goTo(index);
    resetAutoplay();
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={ariaLabel ?? `Go to slide ${index + 1}`}
      data-ui="carousel-indicator"
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

export const Carousel = Object.assign(
  function Carousel(
    props: CarouselRootProps & { ref?: React.Ref<HTMLDivElement> }
  ) {
    return <CarouselRoot {...props} />;
  },
  {
    Root: CarouselRoot,
    Viewport: CarouselViewport,
    Track: CarouselTrack,
    Slide: CarouselSlide,
    PrevTrigger: CarouselPrevTrigger,
    NextTrigger: CarouselNextTrigger,
    Indicator: CarouselIndicator,
  }
);
