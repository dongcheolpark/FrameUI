import React, { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Carousel } from "./Carousel";

afterEach(() => {
  cleanup();
});

function Basic({
  children,
  ...rootProps
}: React.ComponentProps<typeof Carousel.Root>) {
  return (
    <Carousel.Root aria-label="test carousel" {...rootProps}>
      <Carousel.Viewport>
        <Carousel.Track>
          <Carousel.Slide>Slide 1</Carousel.Slide>
          <Carousel.Slide>Slide 2</Carousel.Slide>
          <Carousel.Slide>Slide 3</Carousel.Slide>
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.PrevTrigger>Prev</Carousel.PrevTrigger>
      <Carousel.NextTrigger>Next</Carousel.NextTrigger>
      <div role="tablist" aria-label="indicators">
        <Carousel.Indicator index={0}>1</Carousel.Indicator>
        <Carousel.Indicator index={1}>2</Carousel.Indicator>
        <Carousel.Indicator index={2}>3</Carousel.Indicator>
      </div>
      {children}
    </Carousel.Root>
  );
}

function getSlides(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-ui="carousel-slide"]'),
  );
}

describe("Carousel (uncontrolled)", () => {
  it("defaultIndex 기반 초기 active slide 렌더링", () => {
    render(<Basic defaultIndex={1} />);

    const slides = getSlides();
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute("data-state", "inactive");
    expect(slides[1]).toHaveAttribute("data-state", "active");
    expect(slides[2]).toHaveAttribute("data-state", "inactive");
  });

  it("Slide의 aria-label은 'n of total' 포맷이다", () => {
    render(<Basic />);
    const slides = getSlides();
    expect(slides[0]).toHaveAttribute("aria-label", "1 of 3");
    expect(slides[1]).toHaveAttribute("aria-label", "2 of 3");
    expect(slides[2]).toHaveAttribute("aria-label", "3 of 3");
  });

  it("NextTrigger 클릭 시 다음 slide가 활성화된다", async () => {
    const user = userEvent.setup();
    render(<Basic />);

    await user.click(screen.getByRole("button", { name: "Next slide" }));

    const slides = getSlides();
    expect(slides[1]).toHaveAttribute("data-state", "active");
  });

  it("PrevTrigger 클릭 시 이전 slide로 이동한다", async () => {
    const user = userEvent.setup();
    render(<Basic defaultIndex={2} />);

    await user.click(screen.getByRole("button", { name: "Previous slide" }));

    const slides = getSlides();
    expect(slides[1]).toHaveAttribute("data-state", "active");
  });
});

describe("Carousel (controlled)", () => {
  it("index prop으로 상태가 제어된다", async () => {
    const onIndexChange = vi.fn();
    const user = userEvent.setup();

    function Controlled() {
      const [idx, setIdx] = useState(0);
      return (
        <Basic
          index={idx}
          onIndexChange={(i) => {
            onIndexChange(i);
            setIdx(i);
          }}
        />
      );
    }

    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Next slide" }));
    expect(onIndexChange).toHaveBeenCalledWith(1);

    expect(getSlides()[1]).toHaveAttribute("data-state", "active");
  });

  it("외부 index가 고정되어 있으면 내부 state가 변하지 않는다", async () => {
    const onIndexChange = vi.fn();
    const user = userEvent.setup();

    render(<Basic index={0} onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole("button", { name: "Next slide" }));

    expect(onIndexChange).toHaveBeenCalledWith(1);
    // Parent didn't update, so index stays at 0.
    expect(getSlides()[0]).toHaveAttribute("data-state", "active");
  });
});

describe("Carousel (loop)", () => {
  it("loop=false일 때 첫 슬라이드에서 PrevTrigger는 disabled", () => {
    render(<Basic />);
    const prev = screen.getByRole("button", { name: "Previous slide" });
    expect(prev).toBeDisabled();
    expect(prev).toHaveAttribute("data-disabled");
  });

  it("loop=false일 때 마지막 슬라이드에서 NextTrigger는 disabled", () => {
    render(<Basic defaultIndex={2} />);
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(next).toBeDisabled();
    expect(next).toHaveAttribute("data-disabled");
  });

  it("loop=true이면 끝에서 Next 클릭 시 처음으로 순환한다", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    render(<Basic defaultIndex={2} loop onIndexChange={onIndexChange} />);

    const next = screen.getByRole("button", { name: "Next slide" });
    expect(next).not.toBeDisabled();

    await user.click(next);
    expect(onIndexChange).toHaveBeenCalledWith(0);
    expect(getSlides()[0]).toHaveAttribute("data-state", "active");
  });

  it("loop=true이면 처음에서 Prev 클릭 시 마지막으로 순환한다", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    render(<Basic defaultIndex={0} loop onIndexChange={onIndexChange} />);

    const prev = screen.getByRole("button", { name: "Previous slide" });
    expect(prev).not.toBeDisabled();

    await user.click(prev);
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });
});

describe("Carousel (keyboard)", () => {
  it("horizontal: ArrowRight로 다음, ArrowLeft로 이전 이동", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Basic onIndexChange={onIndexChange} />);

    // Focus an indicator (a tab button) so keydown bubbles to Root.
    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();

    await user.keyboard("{ArrowRight}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    await user.keyboard("{ArrowLeft}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });

  it("vertical: ArrowDown으로 다음, ArrowUp으로 이전 이동", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    render(
      <Carousel.Root
        aria-label="v"
        orientation="vertical"
        onIndexChange={onIndexChange}
      >
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Slide>A</Carousel.Slide>
            <Carousel.Slide>B</Carousel.Slide>
            <Carousel.Slide>C</Carousel.Slide>
          </Carousel.Track>
        </Carousel.Viewport>
        <Carousel.PrevTrigger>Prev</Carousel.PrevTrigger>
        <Carousel.NextTrigger>Next</Carousel.NextTrigger>
      </Carousel.Root>,
    );

    const nextBtn = screen.getByRole("button", { name: "Next slide" });
    nextBtn.focus();

    await user.keyboard("{ArrowDown}");
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    await user.keyboard("{ArrowUp}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });

  it("Home/End로 첫/마지막 슬라이드로 이동", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Basic defaultIndex={1} onIndexChange={onIndexChange} />);

    const tabs = screen.getAllByRole("tab");
    tabs[1]!.focus();

    await user.keyboard("{End}");
    expect(onIndexChange).toHaveBeenLastCalledWith(2);

    await user.keyboard("{Home}");
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
  });
});

describe("Carousel (indicator)", () => {
  it("Indicator 클릭 시 해당 index로 이동한다", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Basic onIndexChange={onIndexChange} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");

    await user.click(tabs[2]!);
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it("active Indicator는 aria-selected=true, data-state=active", () => {
    render(<Basic defaultIndex={1} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("data-state", "active");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[0]).toHaveAttribute("data-state", "inactive");
  });

  it("disabled Indicator도 active 상태면 aria-selected=true를 유지한다", () => {
    render(
      <Carousel.Root aria-label="x" defaultIndex={0}>
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Slide>A</Carousel.Slide>
            <Carousel.Slide>B</Carousel.Slide>
          </Carousel.Track>
        </Carousel.Viewport>
        <div role="tablist">
          <Carousel.Indicator index={0} disabled>
            1
          </Carousel.Indicator>
          <Carousel.Indicator index={1}>2</Carousel.Indicator>
        </div>
      </Carousel.Root>,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("data-state", "active");
    expect(tabs[0]).toBeDisabled();
    expect(tabs[0]).toHaveAttribute("data-disabled");
  });
});

describe("Carousel (ARIA / data attributes)", () => {
  it("Root에 aria-roledescription='carousel'과 data-orientation이 노출된다", () => {
    render(<Basic />);
    const root = document.querySelector(
      '[data-ui="carousel"]',
    ) as HTMLElement;
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
    expect(root).toHaveAttribute("data-orientation", "horizontal");
  });

  it("orientation=vertical이면 Root의 data-orientation=vertical", () => {
    render(
      <Carousel.Root aria-label="v" orientation="vertical">
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Slide>A</Carousel.Slide>
          </Carousel.Track>
        </Carousel.Viewport>
      </Carousel.Root>,
    );

    const root = document.querySelector(
      '[data-ui="carousel"]',
    ) as HTMLElement;
    expect(root).toHaveAttribute("data-orientation", "vertical");
  });

  it("Viewport, Track, Slide의 data-ui 속성이 부여된다", () => {
    render(<Basic />);
    expect(
      document.querySelector('[data-ui="carousel-viewport"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-ui="carousel-track"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelectorAll('[data-ui="carousel-slide"]'),
    ).toHaveLength(3);
  });

  it("Track의 aria-live는 기본값 polite", () => {
    render(<Basic />);
    const track = document.querySelector(
      '[data-ui="carousel-track"]',
    ) as HTMLElement;
    expect(track).toHaveAttribute("aria-live", "polite");
  });
});

describe("Carousel (mount/unmount smoke)", () => {
  it("정상 마운트/언마운트가 일어난다 (autoplay 활성화 포함)", () => {
    const { unmount } = render(
      <Carousel.Root aria-label="a" autoplay={{ interval: 1000 }}>
        <Carousel.Viewport>
          <Carousel.Track>
            <Carousel.Slide>A</Carousel.Slide>
            <Carousel.Slide>B</Carousel.Slide>
          </Carousel.Track>
        </Carousel.Viewport>
      </Carousel.Root>,
    );

    expect(
      document.querySelector('[data-ui="carousel"]'),
    ).toBeInTheDocument();

    unmount();

    expect(
      document.querySelector('[data-ui="carousel"]'),
    ).not.toBeInTheDocument();
  });
});
