import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  LiHTMLAttributes,
  ReactNode,
} from "react";

// --- Types ---
export type FileDropzoneState = "idle" | "dragging" | "invalid";

export type FileDropzoneRejectReason = "type" | "size" | "count";

export interface FileDropzoneRejection {
  file: File;
  reason: FileDropzoneRejectReason;
}

export interface FileDropzoneRootProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> {
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  onReject?: (rejections: FileDropzoneRejection[]) => void;
  children?: ReactNode;
}

export interface FileDropzoneTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export interface FileDropzoneInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "accept" | "multiple" | "onChange"
  > {
  capture?: boolean | "user" | "environment";
}

export interface FileDropzoneZoneProps extends HTMLAttributes<HTMLDivElement> {}

export interface FileDropzoneFileListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  children?: ReactNode | ((file: File) => ReactNode);
}

export interface FileDropzoneFileItemProps extends LiHTMLAttributes<HTMLLIElement> {
  file: File;
}

export interface FileDropzoneRemoveProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  file: File;
}

// --- Context ---
interface FileDropzoneContextValue {
  files: File[];
  state: FileDropzoneState;
  disabled: boolean;
  accept: string | undefined;
  multiple: boolean;
  maxFiles: number | undefined;
  maxSize: number | undefined;
  inputRef: React.RefObject<HTMLInputElement | null>;
  addFiles: (incoming: FileList | File[] | null | undefined) => void;
  removeFile: (file: File) => void;
  openPicker: () => void;
  setDragging: (dragging: boolean) => void;
}

const FileDropzoneContext = createContext<FileDropzoneContextValue | null>(null);

export function useFileDropzoneContext(): FileDropzoneContextValue {
  const ctx = useContext(FileDropzoneContext);
  if (!ctx) {
    throw new Error("FileDropzone components must be used within a FileDropzone.Root");
  }
  return ctx;
}

// --- accept matching helper ---
function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const fileType = (file.type || "").toLowerCase();
  const fileName = (file.name || "").toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return fileName.endsWith(token);
    }
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1); // e.g. "image/"
      return fileType.startsWith(prefix);
    }
    return fileType === token;
  });
}

// --- Root ---
export function FileDropzoneRoot({
  files: controlledFiles,
  defaultFiles = [],
  onFilesChange,
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  disabled = false,
  onReject,
  children,
  className,
  ref,
  ...props
}: FileDropzoneRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [uncontrolledFiles, setUncontrolledFiles] = useState<File[]>(defaultFiles);
  const isControlled = controlledFiles !== undefined;

  const files = useMemo(
    () => (isControlled ? controlledFiles : uncontrolledFiles),
    [isControlled, controlledFiles, uncontrolledFiles],
  );

  const [state, setState] = useState<FileDropzoneState>("idle");
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (invalidTimerRef.current) {
        clearTimeout(invalidTimerRef.current);
      }
    };
  }, []);

  const flashInvalid = useCallback(() => {
    setState("invalid");
    if (invalidTimerRef.current) clearTimeout(invalidTimerRef.current);
    invalidTimerRef.current = setTimeout(() => {
      setState("idle");
      invalidTimerRef.current = null;
    }, 800);
  }, []);

  const setDragging = useCallback(
    (dragging: boolean) => {
      if (disabled) return;
      setState((prev) => {
        if (dragging) return "dragging";
        // leaving drag: only reset if currently dragging (don't clobber "invalid")
        return prev === "dragging" ? "idle" : prev;
      });
    },
    [disabled],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[] | null | undefined) => {
      if (disabled || !incoming) return;
      const asArray: File[] = Array.from(incoming as ArrayLike<File>);
      if (asArray.length === 0) return;

      const rejections: FileDropzoneRejection[] = [];
      let candidates = asArray;

      // If not multiple, only the last candidate wins from incoming;
      // excess from a single drop counts as "count" rejections.
      if (!multiple && candidates.length > 1) {
        const [keep, ...rest] = candidates;
        candidates = keep ? [keep] : [];
        for (const f of rest) rejections.push({ file: f, reason: "count" });
      }

      // count: compare existing + candidates vs maxFiles
      if (typeof maxFiles === "number") {
        const existingCount = multiple ? files.length : 0;
        const available = Math.max(0, maxFiles - existingCount);
        if (candidates.length > available) {
          const kept = candidates.slice(0, available);
          const over = candidates.slice(available);
          for (const f of over) rejections.push({ file: f, reason: "count" });
          candidates = kept;
        }
      }

      // type
      const typePassed: File[] = [];
      for (const f of candidates) {
        if (matchesAccept(f, accept)) {
          typePassed.push(f);
        } else {
          rejections.push({ file: f, reason: "type" });
        }
      }

      // size
      const accepted: File[] = [];
      for (const f of typePassed) {
        if (typeof maxSize === "number" && f.size > maxSize) {
          rejections.push({ file: f, reason: "size" });
        } else {
          accepted.push(f);
        }
      }

      if (rejections.length > 0) {
        onReject?.(rejections);
        flashInvalid();
      }

      if (accepted.length > 0) {
        const next = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
        if (!isControlled) {
          setUncontrolledFiles(next);
        }
        onFilesChange?.(next);
      }
    },
    [
      disabled,
      multiple,
      maxFiles,
      maxSize,
      accept,
      files,
      isControlled,
      onFilesChange,
      onReject,
      flashInvalid,
    ],
  );

  const removeFile = useCallback(
    (target: File) => {
      if (disabled) return;
      const next = files.filter((f) => f !== target);
      if (next.length === files.length) return;
      if (!isControlled) setUncontrolledFiles(next);
      onFilesChange?.(next);
    },
    [disabled, files, isControlled, onFilesChange],
  );

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const ctxValue = useMemo<FileDropzoneContextValue>(
    () => ({
      files,
      state,
      disabled,
      accept,
      multiple,
      maxFiles,
      maxSize,
      inputRef,
      addFiles,
      removeFile,
      openPicker,
      setDragging,
    }),
    [
      files,
      state,
      disabled,
      accept,
      multiple,
      maxFiles,
      maxSize,
      addFiles,
      removeFile,
      openPicker,
      setDragging,
    ],
  );

  return (
    <FileDropzoneContext.Provider value={ctxValue}>
      <div
        ref={ref}
        data-ui="file-dropzone"
        data-state={state}
        data-disabled={disabled ? "" : undefined}
        className={className}
        {...props}
      >
        {children}
      </div>
    </FileDropzoneContext.Provider>
  );
}

// --- Trigger ---
export function FileDropzoneTrigger({
  onClick,
  disabled: triggerDisabled,
  children,
  ref,
  ...props
}: FileDropzoneTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { openPicker, disabled } = useFileDropzoneContext();
  const isDisabled = disabled || triggerDisabled;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) return;
    openPicker();
  };

  return (
    <button
      ref={ref}
      type="button"
      data-ui="file-dropzone-trigger"
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// --- Input ---
export function FileDropzoneInput({
  capture,
  style,
  ref,
  ...props
}: FileDropzoneInputProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { inputRef, accept, multiple, disabled, addFiles } = useFileDropzoneContext();

  // Merge refs: prefer the context ref; expose to caller too if provided.
  const setRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref && typeof ref === "object") {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // reset so the same file can be picked again
    e.target.value = "";
  };

  return (
    <input
      ref={setRef}
      type="file"
      accept={accept}
      multiple={multiple}
      capture={capture as InputHTMLAttributes<HTMLInputElement>["capture"]}
      disabled={disabled}
      aria-hidden="true"
      tabIndex={-1}
      data-ui="file-dropzone-input"
      onChange={handleChange}
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        opacity: 0,
        ...style,
      }}
      {...props}
    />
  );
}

// --- Zone ---
export function FileDropzoneZone({
  onClick,
  onKeyDown,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
  children,
  ref,
  ...props
}: FileDropzoneZoneProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { state, disabled, openPicker, setDragging, addFiles } =
    useFileDropzoneContext();
  const dragCounter = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || disabled) return;
    openPicker();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      openPicker();
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    onDragEnter?.(e);
    if (disabled) return;
    e.preventDefault();
    dragCounter.current += 1;
    setDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    onDragOver?.(e);
    if (disabled) return;
    // always prevent default so the browser accepts the drop
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    onDragLeave?.(e);
    if (disabled) return;
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    onDrop?.(e);
    if (disabled) return;
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const dt = e.dataTransfer;
    addFiles(dt?.files);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    onPaste?.(e);
    if (disabled) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.kind === "file") {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length > 0) addFiles(files);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      data-ui="file-dropzone-zone"
      data-state={state}
      data-disabled={disabled ? "" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      {...props}
    >
      {children}
    </div>
  );
}

// --- FileList ---
export function FileDropzoneFileList({
  children,
  ref,
  ...props
}: FileDropzoneFileListProps & { ref?: React.Ref<HTMLUListElement> }) {
  const { files } = useFileDropzoneContext();

  let content: ReactNode;
  if (typeof children === "function") {
    content = files.map((file, i) => {
      const node = (children as (file: File) => ReactNode)(file);
      // Caller can supply its own key via the FileItem; wrap for safety only if node is raw.
      return (
        <FileListRenderSlot key={`${file.name}-${file.size}-${i}`}>
          {node}
        </FileListRenderSlot>
      );
    });
  } else if (children !== undefined) {
    content = children;
  } else {
    content = files.map((file, i) => (
      <FileDropzoneFileItem key={`${file.name}-${file.size}-${i}`} file={file}>
        {file.name}
      </FileDropzoneFileItem>
    ));
  }

  return (
    <ul
      ref={ref}
      role="list"
      data-ui="file-dropzone-list"
      {...props}
    >
      {content}
    </ul>
  );
}

// Fragment-like wrapper that preserves keys without adding DOM.
function FileListRenderSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// --- FileItem ---
export function FileDropzoneFileItem({
  file,
  children,
  ref,
  ...props
}: FileDropzoneFileItemProps & { ref?: React.Ref<HTMLLIElement> }) {
  return (
    <li
      ref={ref}
      data-ui="file-dropzone-item"
      {...props}
    >
      {children}
    </li>
  );
}

// --- Remove ---
export function FileDropzoneRemove({
  file,
  onClick,
  children,
  "aria-label": ariaLabel,
  ref,
  ...props
}: FileDropzoneRemoveProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { removeFile, disabled } = useFileDropzoneContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || disabled) return;
    removeFile(file);
  };

  return (
    <button
      ref={ref}
      type="button"
      data-ui="file-dropzone-remove"
      aria-label={ariaLabel ?? "Remove file"}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// --- Compound export ---
export const FileDropzone = Object.assign(FileDropzoneRoot, {
  Root: FileDropzoneRoot,
  Trigger: FileDropzoneTrigger,
  Input: FileDropzoneInput,
  Zone: FileDropzoneZone,
  FileList: FileDropzoneFileList,
  FileItem: FileDropzoneFileItem,
  Remove: FileDropzoneRemove,
});
