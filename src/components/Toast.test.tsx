import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Toast,
  ToastProvider,
  useToast,
  type ToastProviderProps,
} from "./Toast";

afterEach(() => {
  cleanup();
});

function Harness({
  onReady,
  ...providerProps
}: { onReady: (api: ReturnType<typeof useToast>) => void } & ToastProviderProps) {
  return (
    <ToastProvider {...providerProps}>
      <ApiBinder onReady={onReady} />
      <Toast.Viewport />
    </ToastProvider>
  );
}

function ApiBinder({ onReady }: { onReady: (api: ReturnType<typeof useToast>) => void }) {
  const api = useToast();
  onReady(api);
  return null;
}

describe("Toast", () => {
  it("선언형 Compound로 메시지를 노출한다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root>
            <Toast.Title>저장됨</Toast.Title>
            <Toast.Description>프로필이 업데이트되었습니다.</Toast.Description>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(screen.getByText("저장됨")).toBeDefined();
    expect(screen.getByText("프로필이 업데이트되었습니다.")).toBeDefined();
  });

  it("type='background'는 role=status + aria-live=polite를 적용한다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root type="background">
            <Toast.Title>info</Toast.Title>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const root = screen.getByRole("status");
    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.getAttribute("data-type")).toBe("background");
  });

  it("type='foreground'는 role=alertdialog + aria-live=assertive를 적용한다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root type="foreground">
            <Toast.Title>warn</Toast.Title>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const root = screen.getByRole("alertdialog");
    expect(root.getAttribute("aria-live")).toBe("assertive");
    expect(root.getAttribute("data-type")).toBe("foreground");
  });

  it("Close 버튼을 누르면 닫히고 onOpenChange(false)가 호출된다", () => {
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root onOpenChange={onOpenChange}>
            <Toast.Title>hi</Toast.Title>
            <Toast.Close />
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("hi")).toBeNull();
  });

  it("명령형 toast()가 새 토스트를 큐에 추가하고 duration 경과 시 자동으로 닫힌다", () => {
    vi.useFakeTimers();
    let api!: ReturnType<typeof useToast>;
    render(<Harness duration={1000} onReady={(a) => (api = a)} />);

    act(() => {
      api.toast({ title: "saved" });
    });
    expect(screen.getByText("saved")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("saved")).toBeNull();
    vi.useRealTimers();
  });

  it("toast.success / toast.error 가 type을 올바르게 설정한다", () => {
    let api!: ReturnType<typeof useToast>;
    render(<Harness onReady={(a) => (api = a)} />);
    act(() => {
      api.toast.success({ title: "ok" });
      api.toast.error({ title: "fail" });
    });
    expect(screen.getByText("ok").closest("[data-ui='toast-root']")?.getAttribute("data-type")).toBe(
      "background"
    );
    expect(screen.getByText("fail").closest("[data-ui='toast-root']")?.getAttribute("data-type")).toBe(
      "foreground"
    );
  });

  it("limit을 초과하는 토스트는 큐에 대기한다(가시 토스트는 limit개로 제한)", () => {
    let api!: ReturnType<typeof useToast>;
    render(<Harness limit={2} onReady={(a) => (api = a)} />);
    act(() => {
      api.toast({ title: "a" });
      api.toast({ title: "b" });
      api.toast({ title: "c" });
    });
    expect(screen.getAllByRole("status").length).toBe(2);
    expect(screen.getByText("a")).toBeDefined();
    expect(screen.getByText("b")).toBeDefined();
    expect(screen.queryByText("c")).toBeNull();
  });

  it("동일 id로 다시 호출되면 새 노드를 추가하지 않고 업데이트한다(duplicate collapse)", () => {
    let api!: ReturnType<typeof useToast>;
    render(<Harness onReady={(a) => (api = a)} />);
    act(() => {
      api.toast({ id: "save", title: "saving..." });
    });
    expect(screen.getAllByRole("status").length).toBe(1);

    act(() => {
      api.toast({ id: "save", title: "saved!" });
    });
    expect(screen.getAllByRole("status").length).toBe(1);
    expect(screen.getByText("saved!")).toBeDefined();
    expect(screen.queryByText("saving...")).toBeNull();
  });

  it("Viewport에 mouseEnter하면 타이머가 일시정지되고 leave 시 남은 시간부터 재개된다", () => {
    vi.useFakeTimers();
    let api!: ReturnType<typeof useToast>;
    render(<Harness duration={1000} onReady={(a) => (api = a)} />);

    act(() => {
      api.toast({ title: "hover-test" });
    });

    const viewport = screen.getByRole("list");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("hover-test")).toBeDefined();

    act(() => {
      fireEvent.mouseEnter(viewport);
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("hover-test")).toBeDefined();

    act(() => {
      fireEvent.mouseLeave(viewport);
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByText("hover-test")).toBeNull();
    vi.useRealTimers();
  });

  it("dismiss(id)로 명시적 제거가 가능하다", () => {
    let api!: ReturnType<typeof useToast>;
    render(<Harness onReady={(a) => (api = a)} />);
    let id = "";
    act(() => {
      id = api.toast({ title: "removeme" });
    });
    expect(screen.getByText("removeme")).toBeDefined();
    act(() => {
      api.dismiss(id);
    });
    expect(screen.queryByText("removeme")).toBeNull();
  });

  it("duration=Infinity 토스트는 자동으로 닫히지 않는다", () => {
    vi.useFakeTimers();
    let api!: ReturnType<typeof useToast>;
    render(<Harness onReady={(a) => (api = a)} />);
    act(() => {
      api.toast({ title: "sticky", duration: Number.POSITIVE_INFINITY });
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("sticky")).toBeDefined();
    vi.useRealTimers();
  });

  it("Toast.Action 클릭 시 토스트가 닫히고 핸들러가 호출된다", () => {
    const onRetry = vi.fn();
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root type="foreground">
            <Toast.Title>오프라인</Toast.Title>
            <Toast.Action altText="다시 시도" onClick={onRetry}>
              다시 시도
            </Toast.Action>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("오프라인")).toBeNull();
  });

  it("data-* 계약(data-state/data-type/data-priority)을 노출한다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root type="foreground" priority="high">
            <Toast.Title>x</Toast.Title>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const root = screen.getByRole("alertdialog");
    expect(root.getAttribute("data-ui")).toBe("toast-root");
    expect(root.getAttribute("data-state")).toBe("open");
    expect(root.getAttribute("data-type")).toBe("foreground");
    expect(root.getAttribute("data-priority")).toBe("high");
  });

  it("Provider 밖에서 useToast를 호출하면 에러를 던진다", () => {
    function Bad() {
      useToast();
      return null;
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow();
    spy.mockRestore();
  });
});

describe("Toast asChild", () => {
  it("Toast.Root에 asChild를 쓰면 <li>가 아닌 자식 엘리먼트로 렌더된다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root asChild type="foreground">
            <section data-testid="custom-root">
              <Toast.Title>x</Toast.Title>
            </section>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const node = screen.getByTestId("custom-root");
    expect(node.tagName.toLowerCase()).toBe("section");
    expect(node.getAttribute("role")).toBe("alertdialog");
    expect(node.getAttribute("aria-live")).toBe("assertive");
    expect(node.getAttribute("data-ui")).toBe("toast-root");
    expect(node.getAttribute("data-state")).toBe("open");
    expect(node.getAttribute("data-type")).toBe("foreground");
    expect(node.getAttribute("aria-atomic")).toBe("true");
  });

  it("Toast.Action에 asChild를 쓰면 ARIA/이벤트가 자식에 머지된다", () => {
    const childClick = vi.fn();
    const parentClick = vi.fn();
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root>
            <Toast.Title>title</Toast.Title>
            <Toast.Action altText="retry" asChild onClick={parentClick}>
              <a href="#retry" data-testid="custom-action" onClick={childClick}>
                다시 시도
              </a>
            </Toast.Action>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const node = screen.getByTestId("custom-action");
    expect(node.tagName.toLowerCase()).toBe("a");
    expect(node.getAttribute("href")).toBe("#retry");
    expect(node.getAttribute("aria-label")).toBe("retry");
    expect(node.getAttribute("data-ui")).toBe("toast-action");

    fireEvent.click(node);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(parentClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("title")).toBeNull();
  });

  it("Toast.Close에 asChild를 쓰면 자식 엘리먼트에 ARIA/이벤트가 머지되고 클릭 시 닫힌다", () => {
    const childClick = vi.fn();
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root>
            <Toast.Title>hello</Toast.Title>
            <Toast.Close asChild>
              <span
                role="button"
                tabIndex={0}
                data-testid="custom-close"
                onClick={childClick}
              >
                닫기
              </span>
            </Toast.Close>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const node = screen.getByTestId("custom-close");
    expect(node.tagName.toLowerCase()).toBe("span");
    expect(node.getAttribute("aria-label")).toBe("Dismiss");
    expect(node.getAttribute("data-ui")).toBe("toast-close");
    fireEvent.click(node);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("hello")).toBeNull();
  });

  it("자식이 preventDefault를 호출하면 slot의 onClick(=닫기)이 실행되지 않는다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root>
            <Toast.Title>keepopen</Toast.Title>
            <Toast.Close asChild>
              <button
                type="button"
                data-testid="prevent-close"
                onClick={(e) => e.preventDefault()}
              >
                X
              </button>
            </Toast.Close>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    fireEvent.click(screen.getByTestId("prevent-close"));
    expect(screen.getByText("keepopen")).toBeDefined();
  });

  it("자식의 className과 style이 slot 값과 머지된다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root
            asChild
            className="slot-cls"
            style={{ color: "red", padding: 4 }}
          >
            <section
              data-testid="merge-target"
              className="child-cls"
              style={{ color: "blue", margin: 8 }}
            >
              <Toast.Title>x</Toast.Title>
            </section>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    const node = screen.getByTestId("merge-target");
    expect(node.className.split(" ").sort()).toEqual(["child-cls", "slot-cls"]);
    expect(node.style.color).toBe("blue");
    expect(node.style.padding).toBe("4px");
    expect(node.style.margin).toBe("8px");
  });

  it("자식의 ARIA prop이 slot 기본값을 덮어쓴다(명시적 override)", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root asChild type="background">
            <section data-testid="override-aria" aria-live="off">
              <Toast.Title>x</Toast.Title>
            </section>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(screen.getByTestId("override-aria").getAttribute("aria-live")).toBe(
      "off"
    );
  });
});

describe("Toast Prop Sniffing", () => {
  it("title/description props만으로 마크업이 자동 조립되고 Close 버튼이 자동 부착된다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root title="저장됨" description="프로필이 업데이트되었습니다." />
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(
      screen.getByText("저장됨").getAttribute("data-ui")
    ).toBe("toast-title");
    expect(
      screen.getByText("프로필이 업데이트되었습니다.").getAttribute("data-ui")
    ).toBe("toast-description");
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeDefined();
  });

  it("action prop으로 전달한 <Toast.Action>이 렌더되고 클릭 시 닫힌다", () => {
    const onRetry = vi.fn();
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root
            type="foreground"
            title="오프라인"
            action={
              <Toast.Action altText="다시 시도" onClick={onRetry}>
                다시 시도
              </Toast.Action>
            }
          />
        </Toast.Viewport>
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("오프라인")).toBeNull();
  });

  it("hideClose=true면 prop 모드여도 자동 Close 버튼이 부착되지 않는다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root title="x" hideClose />
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });

  it("Prop 모드와 children을 혼용하면 dev 경고가 발생하고 children은 렌더되지 않는다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root title="prop-title">
            <Toast.Title>compound-title</Toast.Title>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(warn).toHaveBeenCalled();
    expect(screen.getByText("prop-title")).toBeDefined();
    expect(screen.queryByText("compound-title")).toBeNull();
    warn.mockRestore();
  });

  it("asChild와 prop 모드를 혼용하면 dev 경고가 발생하고 asChild가 우선 적용된다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root asChild title="ignored-title">
            <section data-testid="aschild-wins">
              <Toast.Title>aschild-title</Toast.Title>
            </section>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(warn).toHaveBeenCalled();
    const node = screen.getByTestId("aschild-wins");
    expect(node.tagName.toLowerCase()).toBe("section");
    expect(screen.getByText("aschild-title")).toBeDefined();
    expect(screen.queryByText("ignored-title")).toBeNull();
    warn.mockRestore();
  });

  it("명령형 toast({ title, description, action })가 Prop 모드 경로를 통해 정상 렌더된다", () => {
    const onRetry = vi.fn();
    let api!: ReturnType<typeof useToast>;
    render(<Harness onReady={(a) => (api = a)} />);
    act(() => {
      api.toast({
        title: "오프라인",
        description: "네트워크를 확인하세요.",
        action: (
          <Toast.Action altText="다시 시도" onClick={onRetry}>
            다시 시도
          </Toast.Action>
        ),
      });
    });
    expect(screen.getByText("오프라인").getAttribute("data-ui")).toBe(
      "toast-title"
    );
    expect(screen.getByText("네트워크를 확인하세요.").getAttribute("data-ui")).toBe(
      "toast-description"
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("오프라인")).toBeNull();
  });

  it("title/description/action 모두 없으면 children(Compound 모드)이 그대로 렌더된다", () => {
    render(
      <ToastProvider>
        <Toast.Viewport>
          <Toast.Root>
            <Toast.Title>compound-only</Toast.Title>
          </Toast.Root>
        </Toast.Viewport>
      </ToastProvider>
    );
    expect(screen.getByText("compound-only")).toBeDefined();
  });
});