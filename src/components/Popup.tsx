import { useCallback, useMemo, useState, useEffect } from "react";
import type { HTMLAttributes } from "react";

export interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  message?: string;
  type?: "info" | "success" | "error";
  duration?: number;
}

export function Popup({
  isOpen,
  defaultOpen = false,
  onOpenChange,
  message,
  type = "info",
  duration = 3000,
  ...props
}: PopupProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = isOpen !== undefined;
  const currentOpen = useMemo(
    () => (isControlled ? isOpen : uncontrolledOpen),
    [isOpen, isControlled, uncontrolledOpen]
  );

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  }, [isControlled, onOpenChange]);

  useEffect(() => {
    if (currentOpen && duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [currentOpen, duration, handleClose]);

  if (!currentOpen) return null;

  return (
    <div
      className={`popup-item popup-${type}`}
      data-state={currentOpen ? "open" : "closed"}
      role="status"
      {...props}
    >
      <div className="popup-content">{message}</div>
      <button className="popup-close" onClick={handleClose} aria-label="Dismiss">×</button>
    </div>
  );
}