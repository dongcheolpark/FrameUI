import { Carousel } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

const basicCode = `import { Carousel } from "FrameUI";

export function Demo() {
  return (
    <Carousel defaultIndex={0} aria-label="Seasons">
      <Carousel.PrevTrigger>‹</Carousel.PrevTrigger>
      <Carousel.Viewport>
        <Carousel.Track>
          {seasons.map((label) => (
            <Carousel.Slide key={label}>{label}</Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.NextTrigger>›</Carousel.NextTrigger>
    </Carousel>
  );
}`;

const autoplayCode = `<Carousel defaultIndex={0} loop autoplay={{ interval: 2500 }} pauseOnHover>
  ...
</Carousel>`;

const indicatorCode = `<Carousel defaultIndex={0}>
  <Carousel.Viewport>
    <Carousel.Track>...</Carousel.Track>
  </Carousel.Viewport>
  <div role="tablist">
    {slides.map((_, i) => (
      <Carousel.Indicator key={i} index={i} aria-label={\`Go to \${i + 1}\`} />
    ))}
  </div>
</Carousel>`;

export function CarouselPage() {
  return (
    <article className="page">
      <PageHeader
        category="Disclosure"
        title="Carousel"
        description="슬라이드 캐러셀. 드래그/스와이프, 키보드, autoplay, 포커스/호버 일시정지, prefers-reduced-motion까지 지원합니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Carousel } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <Carousel defaultIndex={0} aria-label="Seasons" className="demo-carousel">
              <Carousel.PrevTrigger className="demo-carousel-btn">‹</Carousel.PrevTrigger>
              <Carousel.Viewport className="demo-carousel-viewport">
                <Carousel.Track>
                  {SEASONS.map((label) => (
                    <Carousel.Slide key={label} className="demo-carousel-slide">
                      {label}
                    </Carousel.Slide>
                  ))}
                </Carousel.Track>
              </Carousel.Viewport>
              <Carousel.NextTrigger className="demo-carousel-btn">›</Carousel.NextTrigger>
            </Carousel>
          }
          code={basicCode}
        />
      </Section>

      <Section id="autoplay" title="Autoplay and loop">
        <p>
          <code>autoplay</code>는 <code>true</code>를 주면 5초 간격으로 자동 재생되고, 객체 형태로 <code>interval</code>을 지정할 수 있습니다.
          <code>loop</code>를 켜면 끝에서 처음으로 순환합니다. 사용자가 <code>prefers-reduced-motion</code>을 켜면 자동 정지합니다.
        </p>
        <Example
          preview={
            <Carousel defaultIndex={0} loop autoplay={{ interval: 2500 }} className="demo-carousel">
              <Carousel.PrevTrigger className="demo-carousel-btn">‹</Carousel.PrevTrigger>
              <Carousel.Viewport className="demo-carousel-viewport">
                <Carousel.Track>
                  {SEASONS.map((label) => (
                    <Carousel.Slide key={label} className="demo-carousel-slide">
                      {label}
                    </Carousel.Slide>
                  ))}
                </Carousel.Track>
              </Carousel.Viewport>
              <Carousel.NextTrigger className="demo-carousel-btn">›</Carousel.NextTrigger>
            </Carousel>
          }
          code={autoplayCode}
        />
      </Section>

      <Section id="indicators" title="Indicators">
        <p>인디케이터 버튼을 추가하면 직접 점프할 수 있습니다.</p>
        <Example
          preview={
            <Carousel defaultIndex={0} className="demo-carousel">
              <Carousel.Viewport className="demo-carousel-viewport">
                <Carousel.Track>
                  {SEASONS.map((label) => (
                    <Carousel.Slide key={label} className="demo-carousel-slide">
                      {label}
                    </Carousel.Slide>
                  ))}
                </Carousel.Track>
              </Carousel.Viewport>
              <div className="demo-carousel-indicators" role="tablist">
                {SEASONS.map((label, i) => (
                  <Carousel.Indicator
                    key={label}
                    index={i}
                    className="demo-carousel-dot"
                    aria-label={`Go to ${label}`}
                  />
                ))}
              </div>
            </Carousel>
          }
          code={indicatorCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <h3>Carousel.Root</h3>
        <PropTable
          rows={[
            { prop: "index / defaultIndex", type: "number", description: "Controlled / uncontrolled 현재 인덱스." },
            { prop: "onIndexChange", type: "(index: number) => void", description: "인덱스가 바뀔 때 호출." },
            { prop: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "방향. 키보드와 드래그 축이 함께 바뀝니다." },
            { prop: "loop", type: "boolean", defaultValue: "false", description: "끝에서 처음으로 순환." },
            { prop: "autoplay", type: "boolean | { interval: number }", defaultValue: "false", description: "자동 재생. 객체로 ms 단위 간격을 지정." },
            { prop: "pauseOnHover", type: "boolean", defaultValue: "true", description: "호버/포커스 시 autoplay 일시정지." },
          ]}
        />
        <h3>Sub-components</h3>
        <PropTable
          rows={[
            { prop: "Carousel.Viewport", type: "div", description: "오버플로우를 숨기고 드래그를 받는 컨테이너." },
            { prop: "Carousel.Track", type: "div", description: "Slide 들을 가로/세로로 배치." },
            { prop: "Carousel.Slide", type: "div", description: "각 슬라이드. 비활성 시 inert + aria-hidden." },
            { prop: "Carousel.PrevTrigger / NextTrigger", type: "button", description: "이전/다음 버튼. loop=false일 때 끝에 도달하면 자동 disabled." },
            { prop: "Carousel.Indicator", type: "button", description: `index prop을 받아 해당 슬라이드로 점프.` },
          ]}
        />
      </Section>
    </article>
  );
}
