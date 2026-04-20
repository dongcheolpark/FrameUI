# ADR 0002: Carousel 컴포넌트 (Carousel Component)

## 1. 배경 및 문제 (Context & Problem)

이미지/카드 캐러셀은 웹에서 가장 흔하게 사용되는 인터랙션 패턴이지만, 동시에 접근성과 UX 측면에서 가장 자주 무너지는 컴포넌트이기도 합니다. FrameUI가 타겟팅하는 "견고함과 단순함 사이의 스윗스팟" 관점에서 볼 때, 기존 구현들은 다음과 같은 반복되는 결함을 보입니다.

- **스와이프 전용 UI**: 모바일에서 터치 스와이프만 지원하고 PC에서 키보드·버튼 네비게이션을 제공하지 않아, 키보드 사용자와 스크린리더 사용자가 슬라이드를 탐색할 수 없습니다.
- **포커스 관리 부실**: 비활성 슬라이드 내부의 링크·버튼이 여전히 `Tab` 포커스 순서에 포함되어, 시각적으로 보이지 않는 요소에 포커스가 빨려 들어가는 문제가 발생합니다.
- **끝없는 autoplay**: 사용자의 읽는 속도를 무시하고 일정 간격으로 슬라이드가 바뀌며, 일시정지 버튼도 제공되지 않습니다. WCAG 2.2.2(Pause, Stop, Hide)를 만족하지 못합니다.
- **스크린리더 미지원**: 현재 몇 번째 슬라이드인지, 전체가 몇 개인지, 변경되었을 때 무슨 일이 일어났는지 전혀 안내되지 않습니다. 단순 `<div>`로만 구성된 경우 "carousel"이라는 역할 자체가 전달되지 않습니다.
- **모바일 UX의 일관성 부족**: 네이티브 스크롤 관성, 세이프 에어리어, 탭 타겟 크기, `prefers-reduced-motion` 등 OS 레벨 컨벤션을 무시한 채 자체 트윈 애니메이션에만 의존하는 경우가 많습니다.

Carousel은 "한 줄짜리 API로 즉시 쓸 수 있으면서, 필요할 때는 분해해서 완전히 재조립할 수 있는" FrameUI의 철학을 검증하기에 가장 까다로운 케이스입니다. 따라서 본 ADR에서는 구조·접근성·모바일 UX를 하나의 결정으로 묶어 정의합니다.

## 2. 결정 (Decision)

Carousel은 FrameUI의 기존 컴포넌트(`Tabs`, `Switch`, `Dialog`)에서 확립된 관례를 그대로 따릅니다.

- **Compound 구조**: `Root / Viewport / Track / Slide / PrevTrigger / NextTrigger / Indicator`로 역할을 분리하고, `Object.assign`으로 `Carousel.Root`, `Carousel.Slide` 형태의 네임스페이스를 제공합니다.
- **Controlled / Uncontrolled 이중 API**: Root는 `index`(controlled) / `defaultIndex`(uncontrolled) / `onIndexChange`(알림) 세 가지를 모두 받습니다. 내부 구현은 `Tabs.Root`의 `value` 패턴과 동일한 형태를 재사용합니다.
- **Context 공유**: 현재 인덱스, 총 슬라이드 수, orientation, loop 여부, autoplay 상태 등을 `CarouselContext`로 내려보내고, 하위 컴포넌트는 `useCarouselContext()`로 접근합니다.
- **Data 속성 노출**: Root는 `data-ui="carousel"`, `data-orientation="horizontal|vertical"`을 항상 노출하고, 현재 슬라이드에는 `data-state="active"`를 부여합니다. Prev/NextTrigger는 양 끝에 도달하고 `loop=false`일 때 `data-disabled`를 노출합니다.
- **asChild 지원**: `Carousel.PrevTrigger`, `Carousel.NextTrigger`, `Carousel.Indicator`는 기본적으로 `<button>`을 렌더링하지만, `asChild`로 사용자의 커스텀 버튼에 ARIA/이벤트 속성만 융합할 수 있습니다.

별도의 로우레벨 훅(예: `useCarousel()`)은 노출하지 않습니다. 확장 요구사항은 Compound 분해로 해결합니다 — ADR 0001에서 합의된 "점진적 컴포넌트 확장" 원칙과 일치합니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

Carousel은 데스크톱보다 모바일에서 훨씬 자주 소비되는 컴포넌트이므로, 모바일 환경의 네이티브 감각을 깨뜨리지 않는 것이 최우선 목표입니다.

### 3.1. 터치 스와이프 (Pointer Events)

- 스와이프는 **Pointer Events** (`pointerdown`/`pointermove`/`pointerup`)로 통일합니다. Touch/Mouse 이벤트를 각각 처리하지 않습니다 — iOS Safari 포함 최신 브라우저는 Pointer Events를 지원하며, 마우스·터치·펜을 일관된 API로 다룰 수 있습니다.
- Track에는 `touch-action: pan-y`(horizontal carousel) 또는 `touch-action: pan-x`(vertical carousel)를 지정합니다. **캐러셀 축과 반대되는 축의 네이티브 스크롤은 반드시 허용**해야 하며, 이렇게 해야 페이지 세로 스크롤 중에 실수로 가로 스와이프가 걸려 잠기는 현상을 막을 수 있습니다.
- 드래그 임계값은 슬라이드 너비의 일정 비율(예: 15%) 또는 속도(velocity) 중 하나를 만족하면 다음 슬라이드로 넘어가도록 합니다. 임계값 미달 시 원래 자리로 되돌립니다(snap-back).

### 3.2. CSS scroll-snap 활용

- Viewport와 Track은 기본적으로 CSS `scroll-snap`(`scroll-snap-type: x mandatory`, 각 Slide에 `scroll-snap-align: start`)을 활용할 수 있도록 설계합니다. 이는 모바일 브라우저의 **관성 스크롤(momentum scroll)**과 스냅 동작을 무료로 얻는 가장 안정적인 방법입니다.
- JS 기반 transform 애니메이션은 `scroll-snap`으로 처리 불가능한 기능(예: loop, autoplay, 외부 `index` 동기화)에만 사용합니다. 기본 네비게이션은 `scrollTo()` + `behavior: "smooth"`를 우선합니다.
- 대신 두 방식이 섞일 때의 상태 동기화(`scroll` 이벤트 → `index` 업데이트)는 `IntersectionObserver`로 "현재 Viewport 중앙에 가장 많이 겹치는 Slide"를 감지하여 결정합니다.

### 3.3. 세이프 에어리어 및 세로 회전

- Viewport 좌우 패딩에 `env(safe-area-inset-left)` / `env(safe-area-inset-right)` 활용을 허용(권장)합니다. 노치/다이나믹 아일랜드가 있는 기기에서 첫/마지막 슬라이드 가장자리가 잘리지 않습니다.
- `orientation="vertical"`과 세로 회전(포트레이트 ↔ 랜드스케이프) 대응 시, Track의 `flex-direction`과 스크롤 축을 동적으로 전환합니다. `ResizeObserver`로 Viewport 크기 변화를 감지하여 현재 인덱스의 스크롤 위치를 재계산합니다.

### 3.4. Autoplay의 모바일 친화 정지 규칙

Autoplay는 **기본값 off**이며, 활성화되더라도 다음 상황에서 자동 일시정지됩니다.

- `IntersectionObserver`로 Root가 뷰포트 밖(또는 설정한 `threshold` 이하)일 때 정지 — 화면에 보이지 않는 캐러셀이 데이터와 배터리를 낭비하지 않도록 합니다.
- `document.visibilitychange` → `document.hidden === true`일 때 정지 — 탭 전환·앱 백그라운드 시 실행을 멈춥니다.
- Root 또는 내부 요소가 hover/focus 상태일 때 정지(`pauseOnHover` 기본 true).
- `window.matchMedia('(prefers-reduced-motion: reduce)')`이 true이면 autoplay를 **즉시 비활성화**합니다.

### 3.5. 탭 타겟 크기

- `Carousel.PrevTrigger` / `NextTrigger` / `Indicator`의 기본 hit area는 **최소 44×44 CSS 픽셀**을 권장(문서화)합니다. 헤드리스이므로 스타일을 강제하진 않지만, FrameUI 기본 CSS 파일(예: `carousel.css`)에서 권장 최소값을 제공하고 README에 Apple HIG / Material Touch Target 가이드를 인용합니다.
- Indicator의 시각적 점은 작아도, 버튼의 `padding`으로 실제 탭 타겟을 키우는 패턴을 권장합니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

### 4.1. 역할(Role)과 라벨

- **Root**: `aria-roledescription="carousel"`. 사용자가 `aria-label` 또는 `aria-labelledby`로 캐러셀의 주제(예: "추천 상품")를 반드시 지정하도록 문서화합니다.
- **Track**: `aria-live="polite"`를 기본 적용합니다. 슬라이드가 변경될 때 현재 슬라이드의 `aria-label`("3 of 5")이 스크린리더로 읽힙니다. 단, autoplay 중에는 `aria-live`를 `off`로 다운그레이드하여 스크린리더 사용자를 괴롭히지 않도록 합니다(autoplay가 일시정지되면 다시 `polite`).
- **Slide**: 각 슬라이드에 `aria-roledescription="slide"`, `aria-label="{index + 1} of {total}"`, `role="group"`.
- **PrevTrigger / NextTrigger**: 네이티브 `<button>`으로 렌더링, `aria-label="Previous slide"` / `"Next slide"` 기본값 제공. 양 끝에 도달하고 `loop=false`이면 `disabled` + `data-disabled`.
- **Indicator**: 점 네비게이션은 `role="tablist"` 패턴을 채택 — 각 점은 `role="tab"` + `aria-selected`, Track은 대응되는 `role="tabpanel"` 의미를 가집니다. 이는 FrameUI `Tabs` 구현과 일관성을 유지합니다.

### 4.2. 키보드 네비게이션

- **ArrowRight / ArrowLeft**: `orientation="horizontal"`일 때 다음/이전 슬라이드.
- **ArrowDown / ArrowUp**: `orientation="vertical"`일 때 다음/이전 슬라이드.
- **Home / End**: 첫/마지막 슬라이드.
- 키 핸들링은 Root 또는 Indicator의 `role="tablist"`에 바인딩하며, `Tabs.List`의 기존 구현을 참고하여 포커스 기반으로 동작합니다.

### 4.3. 비활성 슬라이드의 포커스 트랩 방지

비활성 슬라이드 내부에 포커서블 요소(링크, 버튼, 입력)가 있을 경우, 시각적으로 숨겨진 상태에서 `Tab` 키로 진입하는 문제가 발생합니다. 이를 막기 위해:

- 현대 브라우저(Baseline)에서는 비활성 Slide에 **`inert` 속성**을 부여하는 것을 기본으로 합니다.
- `inert` 미지원 환경 폴백으로, 비활성 Slide 내부의 모든 포커서블 요소에 `tabIndex={-1}`을 적용하고, `aria-hidden="true"`를 부여합니다.
- 활성 슬라이드는 `inert`를 해제하고, 내부 포커서블 요소의 `tabIndex`를 원복합니다.

### 4.4. Autoplay 일시정지 버튼

Autoplay가 활성화된 경우, **명시적인 일시정지 버튼을 함께 제공하는 것을 강력히 권장**하고 문서화합니다. WCAG 2.2.2를 만족하기 위함입니다. Compound에서 `Carousel.AutoplayControl`은 본 ADR 범위에 포함하지 않으며, 사용자가 `onIndexChange`와 별도의 state로 직접 제어하거나, 향후 별도 ADR로 추가합니다.

### 4.5. Reduced Motion

`prefers-reduced-motion: reduce`가 감지되면:

- Autoplay는 시작되지 않습니다.
- 슬라이드 간 전환은 애니메이션 없이 **즉시 이동(instant jump)**합니다. `scrollTo()` 호출 시 `behavior: "auto"`로 폴백합니다.

### 4.6. 무한 loop의 스크린리더 혼란 방지

`loop=true`는 시각적으로 끝없는 캐러셀을 제공하지만, 스크린리더 사용자에게는 "5 of 5" 다음에 "1 of 5"가 갑자기 등장하여 혼란을 줍니다. 다음 원칙을 적용합니다.

- loop가 활성화되어도 `aria-label`은 실제 논리적 인덱스(1..N)를 유지합니다.
- Track의 `aria-live`는 loop 경계를 넘을 때도 동일하게 "1 of 5"를 안내합니다 — 별도의 "처음으로 돌아갑니다" 음성은 추가하지 않습니다. 스크린리더 사용자는 Prev/Next 버튼의 `disabled` 상태가 사라진 것으로 loop를 간접 인지할 수 있습니다.
- DOM 수준에서의 슬라이드 복제(cloning)는 ARIA 트리를 오염시키므로 **사용하지 않습니다**. 대신 transform/scroll 위치 조작만으로 시각적 loop를 구현합니다.

## 5. API 설계 (API Design)

### 5.1. Root Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `index` | `number` | — | Controlled 현재 인덱스. 지정 시 uncontrolled state는 무시됩니다. |
| `defaultIndex` | `number` | `0` | Uncontrolled 초기 인덱스. |
| `onIndexChange` | `(index: number) => void` | — | 인덱스 변경 시 호출되는 콜백. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | 슬라이드 이동 축. `data-orientation`으로도 노출됩니다. |
| `loop` | `boolean` | `false` | 마지막에서 다음을 누르면 처음으로 돌아갑니다. |
| `autoplay` | `boolean \| { interval: number }` | `false` | `true`는 기본 간격(예: 5000ms), 객체 형태는 `interval`을 명시합니다. |
| `pauseOnHover` | `boolean` | `true` | hover/focus 시 autoplay 일시정지. |

### 5.2. Compound 컴포넌트 책임

- **`Carousel.Root`**: Context 프로바이더, controlled/uncontrolled 조정, autoplay 타이머, `IntersectionObserver` / `visibilitychange` 핸들링, 키보드 이벤트 위임. `data-ui="carousel"`, `data-orientation`.
- **`Carousel.Viewport`**: 슬라이드가 보이는 윈도우. `overflow: hidden`(권장), `touch-action` 지정, `scroll-snap` 컨테이너 역할. Pointer 이벤트 루트.
- **`Carousel.Track`**: 모든 Slide를 담는 내부 컨테이너. `role="group"`, `aria-live` 관리, transform/scroll 실제 이동 수행.
- **`Carousel.Slide`**: 개별 슬라이드. `aria-roledescription="slide"`, `aria-label`, `data-state`, 비활성 시 `inert`.
- **`Carousel.PrevTrigger` / `Carousel.NextTrigger`**: 네이티브 `<button>`. 양 끝 + `loop=false`에서 자동 `disabled`. `asChild` 지원.
- **`Carousel.Indicator`**: 점 네비게이션. `role="tab"` + `aria-selected`, 클릭 시 해당 인덱스로 이동. 단일 Indicator는 개별 점, 부모 컨테이너는 `role="tablist"`.

## 6. 사용 예시 (Usage Examples)

### 6.1. 기본 모드 (Compound 최소 구성)

```tsx
// 가장 흔한 유즈케이스: uncontrolled, horizontal, loop 없이.
// 접근성·키보드·터치 스와이프는 자동으로 처리됩니다.
import { Carousel } from "frame-ui";

export default function ProductGallery() {
  return (
    <Carousel.Root defaultIndex={0} aria-label="추천 상품">
      <Carousel.Viewport>
        <Carousel.Track>
          <Carousel.Slide>
            <img src="/shoes-1.jpg" alt="러닝화" />
          </Carousel.Slide>
          <Carousel.Slide>
            <img src="/shoes-2.jpg" alt="트레일화" />
          </Carousel.Slide>
          <Carousel.Slide>
            <img src="/shoes-3.jpg" alt="캐주얼화" />
          </Carousel.Slide>
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.PrevTrigger>이전</Carousel.PrevTrigger>
      <Carousel.NextTrigger>다음</Carousel.NextTrigger>
    </Carousel.Root>
  );
}
```

### 6.2. 확장 모드 (Controlled + Autoplay + Indicator + asChild)

```tsx
// 외부 상태와 동기화하고, autoplay와 Indicator를 추가하며,
// 커스텀 버튼에 접근성 속성만 융합하는 형태.
import { useState } from "react";
import { Carousel } from "frame-ui";
import { MyIconButton } from "@/components/MyIconButton";

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const slides = ["spring", "summer", "autumn"];

  return (
    <Carousel.Root
      index={index}
      onIndexChange={setIndex}
      loop
      autoplay={{ interval: 6000 }}
      pauseOnHover
      aria-label="시즌 배너"
    >
      <Carousel.Viewport>
        <Carousel.Track>
          {slides.map((s) => (
            <Carousel.Slide key={s}>
              <HeroCard season={s} />
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>

      <Carousel.PrevTrigger asChild>
        <MyIconButton icon="chevron-left" />
      </Carousel.PrevTrigger>
      <Carousel.NextTrigger asChild>
        <MyIconButton icon="chevron-right" />
      </Carousel.NextTrigger>

      <div role="tablist" aria-label="슬라이드 선택">
        {slides.map((s, i) => (
          <Carousel.Indicator key={s} index={i} />
        ))}
      </div>
    </Carousel.Root>
  );
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

### 7.1. Embla Carousel / Swiper 래핑

- **장점**: 검증된 스와이프 물리 엔진, loop, 가상 스크롤 등 복잡한 기능이 이미 해결됨. 구현 시간을 크게 단축할 수 있음.
- **단점**: FrameUI의 "의존성 최소, 헤드리스 일관성, React 19+ 타겟" 원칙과 충돌. Embla는 훅 기반이라 FrameUI의 Compound 관례와 어긋나고, Swiper는 자체 스타일/요소를 강제함. 번들 크기도 증가. FrameUI의 `data-ui`/`data-state` 관례를 한 번 더 래핑하여 덧씌워야 하는 중복 레이어가 발생함.
- **결론**: 채택하지 않음. 다만 내부 구현 시 Embla의 `scroll-snap` 활용 전략은 참고.

### 7.2. 단순 `overflow-x: scroll` 폴백

- **장점**: 구현이 거의 0에 가까움. 네이티브 스크롤/스냅/접근성을 대부분 무료로 얻음.
- **단점**: `index` 제어, autoplay, loop, Prev/Next 버튼, 키보드 네비게이션 등 FrameUI가 보장해야 하는 기능을 전혀 제공하지 못함. "원하면 기본으로도 쓸 수 있다"는 FrameUI의 DX 목표에 미달.
- **결론**: 단독 채택은 하지 않음. 단, `Carousel.Viewport`의 내부 구현이 `scroll-snap`을 적극 활용하는 방식으로 이 아이디어를 흡수함(§3.2).

### 7.3. 로우레벨 `useCarousel()` 훅 노출

- **장점**: 최대의 유연성. 사용자가 마크업을 완전히 제어.
- **단점**: ADR 0001에서 명시적으로 배제한 방향. 접근성 보장이 사용자 책임으로 넘어가면서 FrameUI의 핵심 가치(a11y 준수)가 무너짐.
- **결론**: 채택하지 않음. 확장은 Compound 분해와 `asChild`로 충분.

## 8. 결과 (Consequences)

### 8.1. Positive

- FrameUI 전역에서 일관된 Compound / Controlled-Uncontrolled / `data-ui` 관례가 Carousel까지 확장됩니다. 이미 `Tabs`, `Switch`를 써본 사용자는 새로운 API를 거의 학습하지 않고도 Carousel을 쓸 수 있습니다.
- WAI-ARIA Carousel 패턴, 키보드 네비게이션, `inert` 기반 포커스 관리, `prefers-reduced-motion` 대응이 **기본값으로** 보장됩니다.
- 모바일에서 네이티브 `scroll-snap` + Pointer Events + 탭 타겟 44px 권장 조합으로, OS 컨벤션을 거스르지 않는 캐러셀을 제공합니다.

### 8.2. Negative

- Pointer Events + `scroll-snap` + JS 기반 `index` 동기화를 동시에 다루는 구현 복잡도가 기존 컴포넌트 대비 높습니다. 특히 "사용자가 스크롤로 이동 → `index` 업데이트" 경로와 "`index` prop 변경 → 스크롤 이동" 경로가 서로를 덮어쓰지 않도록 이벤트 디바운싱·플래그 제어가 필요합니다.
- `scroll-snap`의 세부 동작(snap 중 `scrollTo` 가로채기, Safari의 관성 스크롤 타이밍)은 브라우저별 편차가 있어, 완전히 동일한 UX를 보장하기 어렵습니다.
- `inert`는 최신 브라우저에만 네이티브로 존재하여 폴백(`tabIndex` 조작)이 필요하고, 이로 인해 구현 분기가 늘어납니다.

### 8.3. Ongoing

- Pointer Events와 터치 제스처는 실제 기기(iOS Safari, Android Chrome, 데스크톱 Safari/Firefox/Chrome) 매트릭스에서의 지속적인 수동 QA가 필요합니다. 자동화 테스트만으로는 잡히지 않는 제스처 오작동이 꾸준히 보고될 것입니다.
- `aria-live` + autoplay + loop의 조합이 실제 스크린리더(VoiceOver, NVDA, JAWS)에서 어떻게 읽히는지는 주기적으로 재검증합니다. 스크린리더 벤더의 업데이트에 따라 동작이 바뀔 수 있습니다.
- 향후 `Carousel.AutoplayControl`(일시정지 버튼), 가상 슬라이드(대량 렌더링 최적화), 드래그 중 프리뷰 등의 확장은 별도 ADR로 다룹니다. 본 ADR의 범위는 명세에 확정된 구조·Props·동작 규칙으로 한정합니다.
