import { useCallback, useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  footerSlot?: ReactNode;
  children?: ReactNode;
}

export function Modal({
  isOpen,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  footerSlot,
  children,
  ...props
}: ModalProps) {
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

  if (!currentOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      data-state={currentOpen ? "open" : "closed"}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        role="dialog"
        aria-modal="true"
        {...props}
      >
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="close-button" onClick={handleClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          {description && <p>{description}</p>}
          {children}
        </div>
        {footerSlot && <div className="modal-footer">{footerSlot}</div>}
      </div>
    </div>
  );
}