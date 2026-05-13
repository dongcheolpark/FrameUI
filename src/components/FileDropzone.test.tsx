import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FileDropzone } from "./FileDropzone";

afterEach(() => cleanup());

// --- helpers ---
function makeFile(name: string, { size = 100, type = "text/plain" } = {}): File {
  const content = "x".repeat(Math.max(1, size));
  const file = new File([content], name, { type });
  // Some happy-dom versions compute size from blob; force it to match requested size.
  if (file.size !== size) {
    Object.defineProperty(file, "size", { value: size, configurable: true });
  }
  return file;
}

function makeDataTransfer(files: File[]): { files: File[]; items: unknown[]; types: string[] } {
  return {
    files,
    items: files.map((f) => ({ kind: "file", type: f.type, getAsFile: () => f })),
    types: ["Files"],
  };
}

function getZone(): HTMLElement {
  const zone = document.querySelector('[data-ui="file-dropzone-zone"]');
  if (!zone) throw new Error("zone not found");
  return zone as HTMLElement;
}

function getRoot(): HTMLElement {
  const root = document.querySelector('[data-ui="file-dropzone"]');
  if (!root) throw new Error("root not found");
  return root as HTMLElement;
}

describe("FileDropzone", () => {
  it("renders defaultFiles in FileList (uncontrolled)", () => {
    const f1 = makeFile("a.txt");
    const f2 = makeFile("b.txt");
    render(
      <FileDropzone defaultFiles={[f1, f2]} multiple>
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
        <FileDropzone.FileList />
      </FileDropzone>,
    );

    expect(screen.getByText("a.txt")).toBeInTheDocument();
    expect(screen.getByText("b.txt")).toBeInTheDocument();
  });

  it("controlled: onFilesChange fires with new files on drop", () => {
    const onFilesChange = vi.fn();
    function Controlled() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <FileDropzone
          files={files}
          multiple
          onFilesChange={(f) => {
            setFiles(f);
            onFilesChange(f);
          }}
        >
          <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
          <FileDropzone.FileList />
        </FileDropzone>
      );
    }
    render(<Controlled />);

    const zone = getZone();
    const file = makeFile("hello.txt");
    fireEvent.drop(zone, { dataTransfer: makeDataTransfer([file]) });

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    const arg = onFilesChange.mock.calls[0]![0] as File[];
    expect(arg).toHaveLength(1);
    expect(arg[0]!.name).toBe("hello.txt");
    expect(screen.getByText("hello.txt")).toBeInTheDocument();
  });

  it("Trigger click calls hidden input.click()", () => {
    render(
      <FileDropzone>
        <FileDropzone.Trigger>Pick</FileDropzone.Trigger>
        <FileDropzone.Input />
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const input = document.querySelector(
      '[data-ui="file-dropzone-input"]',
    ) as HTMLInputElement;
    const spy = vi.spyOn(input, "click").mockImplementation(() => {});

    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("drop triggers onFilesChange with dropped files", () => {
    const onFilesChange = vi.fn();
    render(
      <FileDropzone multiple onFilesChange={onFilesChange}>
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const zone = getZone();
    const f1 = makeFile("a.txt");
    const f2 = makeFile("b.txt");
    fireEvent.drop(zone, { dataTransfer: makeDataTransfer([f1, f2]) });

    expect(onFilesChange).toHaveBeenCalledWith([f1, f2]);
  });

  it("rejects with reason 'type' when accept doesn't match", () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    render(
      <FileDropzone
        accept="image/*"
        onReject={onReject}
        onFilesChange={onFilesChange}
      >
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const zone = getZone();
    const txt = makeFile("a.txt", { type: "text/plain" });
    fireEvent.drop(zone, { dataTransfer: makeDataTransfer([txt]) });

    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onReject.mock.calls[0]![0]).toEqual([{ file: txt, reason: "type" }]);
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("rejects with reason 'size' when maxSize exceeded", () => {
    const onReject = vi.fn();
    render(
      <FileDropzone maxSize={10} onReject={onReject}>
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const big = makeFile("big.txt", { size: 100 });
    fireEvent.drop(getZone(), { dataTransfer: makeDataTransfer([big]) });

    expect(onReject).toHaveBeenCalledWith([{ file: big, reason: "size" }]);
  });

  it("rejects excess with reason 'count' when maxFiles exceeded", () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    render(
      <FileDropzone
        multiple
        maxFiles={2}
        onReject={onReject}
        onFilesChange={onFilesChange}
      >
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const f1 = makeFile("1.txt");
    const f2 = makeFile("2.txt");
    const f3 = makeFile("3.txt");
    fireEvent.drop(getZone(), { dataTransfer: makeDataTransfer([f1, f2, f3]) });

    expect(onFilesChange).toHaveBeenCalledWith([f1, f2]);
    expect(onReject).toHaveBeenCalledWith([{ file: f3, reason: "count" }]);
  });

  it("evaluates count > type > size in fixed order", () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    // maxFiles=2 so that the 3rd file is rejected by count before type/size are checked.
    // All three files would also fail type ("image/*") and size (maxSize=10).
    render(
      <FileDropzone
        multiple
        accept="image/*"
        maxFiles={2}
        maxSize={10}
        onReject={onReject}
        onFilesChange={onFilesChange}
      >
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const f1 = makeFile("1.txt", { type: "text/plain", size: 100 });
    const f2 = makeFile("2.txt", { type: "text/plain", size: 100 });
    const f3 = makeFile("3.txt", { type: "text/plain", size: 100 });
    fireEvent.drop(getZone(), { dataTransfer: makeDataTransfer([f1, f2, f3]) });

    // f3 is rejected by count (first), f1/f2 by type (before size).
    expect(onReject).toHaveBeenCalledTimes(1);
    const rejections = onReject.mock.calls[0]![0] as Array<{
      file: File;
      reason: string;
    }>;
    expect(rejections).toEqual([
      { file: f3, reason: "count" },
      { file: f1, reason: "type" },
      { file: f2, reason: "type" },
    ]);
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("disabled: aria-disabled, and drop/paste/click are no-op", () => {
    const onFilesChange = vi.fn();
    render(
      <FileDropzone disabled onFilesChange={onFilesChange}>
        <FileDropzone.Trigger>Pick</FileDropzone.Trigger>
        <FileDropzone.Input />
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const zone = getZone();
    expect(zone).toHaveAttribute("aria-disabled", "true");
    expect(zone).toHaveAttribute("tabIndex", "-1");

    fireEvent.drop(zone, {
      dataTransfer: makeDataTransfer([makeFile("a.txt")]),
    });
    fireEvent.paste(zone, {
      clipboardData: {
        items: [
          {
            kind: "file",
            type: "text/plain",
            getAsFile: () => makeFile("p.txt"),
          },
        ],
      },
    });
    fireEvent.click(zone);

    const input = document.querySelector(
      '[data-ui="file-dropzone-input"]',
    ) as HTMLInputElement;
    const spy = vi.spyOn(input, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: "Pick" }));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();

    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("dragenter/dragover -> data-state='dragging'; dragleave -> 'idle'", () => {
    render(
      <FileDropzone>
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const root = getRoot();
    const zone = getZone();
    expect(root).toHaveAttribute("data-state", "idle");

    fireEvent.dragEnter(zone, { dataTransfer: makeDataTransfer([]) });
    expect(root).toHaveAttribute("data-state", "dragging");
    expect(zone).toHaveAttribute("data-state", "dragging");

    fireEvent.dragOver(zone, { dataTransfer: makeDataTransfer([]) });
    expect(root).toHaveAttribute("data-state", "dragging");

    fireEvent.dragLeave(zone, { dataTransfer: makeDataTransfer([]) });
    expect(root).toHaveAttribute("data-state", "idle");
  });

  it("Remove button removes the file", () => {
    const f1 = makeFile("a.txt");
    const f2 = makeFile("b.txt");
    const onFilesChange = vi.fn();

    render(
      <FileDropzone
        defaultFiles={[f1, f2]}
        multiple
        onFilesChange={onFilesChange}
      >
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
        <FileDropzone.FileList>
          {(file) => (
            <FileDropzone.FileItem file={file}>
              <span>{file.name}</span>
              <FileDropzone.Remove file={file}>x</FileDropzone.Remove>
            </FileDropzone.FileItem>
          )}
        </FileDropzone.FileList>
      </FileDropzone>,
    );

    const removeButtons = screen.getAllByRole("button", { name: "Remove file" });
    fireEvent.click(removeButtons[0]!);

    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(onFilesChange.mock.calls[0]![0]).toEqual([f2]);
  });

  it("paste collects files from clipboardData", () => {
    const onFilesChange = vi.fn();
    render(
      <FileDropzone multiple onFilesChange={onFilesChange}>
        <FileDropzone.Zone aria-label="zone">drop</FileDropzone.Zone>
      </FileDropzone>,
    );

    const f = makeFile("shot.png", { type: "image/png" });
    fireEvent.paste(getZone(), {
      clipboardData: {
        items: [{ kind: "file", type: "image/png", getAsFile: () => f }],
      },
    });

    expect(onFilesChange).toHaveBeenCalledWith([f]);
  });
});
