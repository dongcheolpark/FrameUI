# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: Carousel
- 한 줄 설명: 이미지/카드 목록을 슬라이드 형태로 탐색할 수 있는 접근성 기반 Compound 컴포넌트

## 2. 해결할 문제

- 스와이프 전용 UI: 모바일 터치에만 의존하고 키보드·버튼 네비게이션이 없어 키보드/스크린리더 사용자가 탐색 불가.
- 포커스 관리 부실: 비활성 슬라이드 내부의 링크·버튼이 `Tab` 순서에 남아 보이지 않는 요소로 포커스가 빨려 들어감.
- 끝없는 autoplay: 일시정지 수단 없이 자동 전환되어 WCAG 2.2.2(Pause, Stop, Hide)를 위반.
- 스크린리더 미지원: 현재/전체 슬라이드 수, 변경 시 안내가 전혀 제공되지 않음.
- OS 컨벤션 무시: 네이티브 관성 스크롤, 세이프 에어리어, 탭 타겟, `prefers-reduced-motion` 등이 반영되지 않음.

## 3. 구조 및 API 명세표 (Compound Components)

### `Carousel.Root`
- 전체 컨텍스트(현재 인덱스, 총 슬라이드 수, orientation, loop, autoplay 상태)를 관리하고, 키보드·autoplay 타이머·`IntersectionObserver`·`visibilitychange`를 제어합니다.
- 기본 렌더링 태그: `<div>`. 자동 부여 속성: `data-ui="carousel"`, `data-orientation`, `aria-roledescription="carousel"`.
- `aria-label` 또는 `aria-labelledby`를 사용자가 지정하도록 문서화(필수 권장).

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `index` | `number` | — | Controlled 현재 인덱스. 지정 시 uncontrolled state는 무시됩니다. |
| `defaultIndex` | `number` | `0` | Uncontrolled 초기 인덱스. |
| `onIndexChange` | `(index: number) => void` | — | 인덱스가 변경될 때 호출되는 콜백. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | 슬라이드 이동 축. `data-orientation`으로 노출됩니다. |
| `loop` | `boolean` | `false` | 마지막에서 다음을 누르면 처음으로 순환합니다. |
| `autoplay` | `boolean \| { interval: number }` | `false` | `true`는 기본 간격(5000ms), 객체는 `interval`을 명시합니다. |
| `pauseOnHover` | `boolean` | `true` | hover/focus 시 autoplay 일시정지. |

### `Carousel.Viewport`
- 슬라이드가 노출되는 윈도우이자 Pointer 이벤트 루트. `overflow: hidden`과 `touch-action`(아래 §4.2) 지정을 전제합니다.
- 기본 렌더링 태그: `<div>`. 자동 부여 속성: `data-ui="carousel-viewport"`.
- `scroll-snap` 컨테이너로도 동작합니다.

### `Carousel.Track`
- 모든 Slide를 담는 내부 컨테이너. 실제 transform/scroll 이동을 수행합니다.
- 기본 렌더링 태그: `<div>`. 자동 부여 속성: `data-ui="carousel-track"`, `role="group"`, `aria-live`(기본 `polite`, autoplay 중 `off`).

### `Carousel.Slide`
- 개별 슬라이드.
- 기본 렌더링 태그: `<div>`. 자동 부여 속성: `data-ui="carousel-slide"`, `data-state="active" | "inactive"`, `aria-roledescription="slide"`, `aria-label="{index + 1} of {total}"`, `role="group"`.
- 비활성 슬라이드는 `inert` 속성을 부여하고, 미지원 환경에서는 `aria-hidden="true"` + 내부 포커서블 요소 `tabIndex={-1}` 폴백을 적용합니다.

### `Carousel.PrevTrigger` / `Carousel.NextTrigger`
- 좌/우(또는 상/하) 이동을 담당하는 **기본 마우스·키보드 핸들**. 데스크톱에서 주된 네비게이션 수단이며 기본적으로 항상 렌더링하는 것을 권장합니다(모바일 전용 UI를 원할 때만 생략).
- 기본 렌더링 태그: 네이티브 `<button>`. `asChild` 지원.
- 자동 부여 속성: `data-ui="carousel-prev" | "carousel-next"`, `aria-label="Previous slide" | "Next slide"`(기본값, override 가능).
- 양 끝에 도달하고 `loop=false`이면 `disabled` + `data-disabled`를 노출합니다.
- 클릭 시 `onIndexChange(index ± 1)`을 호출하며 autoplay가 활성화되어 있으면 타이머를 리셋합니다.

### `Carousel.Indicator`
- 점 네비게이션 버튼. 부모 컨테이너는 `role="tablist"` 패턴을 따릅니다(FrameUI `Tabs`와 일관).
- 기본 렌더링 태그: 네이티브 `<button>`. `asChild` 지원.
- 자동 부여 속성: `data-ui="carousel-indicator"`, `role="tab"`, `aria-selected`, `data-state="active" | "inactive"`.
- Props: `index` (number, 필수) — 클릭 시 이동할 슬라이드 인덱스.

## 4. 핵심 동작 명세

1. 키보드 네비게이션:
   - `orientation="horizontal"`: `ArrowLeft`/`ArrowRight`로 이전/다음 슬라이드.
   - `orientation="vertical"`: `ArrowUp`/`ArrowDown`으로 이전/다음 슬라이드.
   - `Home`/`End`: 첫/마지막 슬라이드.
   - 핸들링은 `Root` 또는 Indicator의 `role="tablist"` 컨테이너에 바인딩하며, `Tabs.List`의 포커스 기반 구현 방식을 재사용합니다.

2. 포인터 드래그 (마우스 · 터치 · 펜):
   - `pointerdown`/`pointermove`/`pointerup`/`pointercancel`을 단일 경로로 처리합니다. Pointer Events가 마우스·터치·펜을 통합하므로 Touch/Mouse 이벤트는 별도로 다루지 않습니다.
   - **데스크톱 마우스 드래그도 1급 상호작용**입니다. `pointerType === "mouse"`일 때도 동일한 드래그 로직이 동작하며, `setPointerCapture`로 Viewport 바깥까지 드래그가 이어져도 추적됩니다.
   - `pointerdown` 시 텍스트/이미지 드래그 고스트를 막기 위해 `preventDefault()` + `user-select: none`을 Track에 적용합니다(이미지 `draggable={false}`도 함께).
   - `Viewport`/`Track`에 `touch-action: pan-y`(horizontal) 또는 `pan-x`(vertical)를 지정하여 반대축 네이티브 스크롤을 허용합니다.
   - 드래그 임계값: 슬라이드 너비의 약 15% 또는 충분한 속도(velocity) 중 하나를 만족하면 전환, 미달 시 snap-back.
   - 포인터 드래그는 보조 입력이며, **주 네비게이션 경로는 §3의 Prev/NextTrigger(마우스 클릭)와 §4.1의 키보드**입니다. 드래그를 지원하지 않거나 비활성화해도 캐러셀은 완전하게 동작해야 합니다.

3. Autoplay 규칙:
   - 기본값 `false`. 활성화 시 다음 조건에서 자동 일시정지합니다.
     - `pauseOnHover=true`이고 hover/focus 상태일 때.
     - `IntersectionObserver`로 Root가 뷰포트 밖일 때.
     - `document.hidden === true`일 때.
     - `matchMedia('(prefers-reduced-motion: reduce)')`가 true이면 autoplay를 **즉시 비활성화**.
   - autoplay 진행 중 Track의 `aria-live`는 `off`로 다운그레이드하고, 일시정지되면 `polite`로 복귀합니다.

4. 비활성 슬라이드 포커스 차단:
   - 기본: 비활성 Slide에 `inert` 속성 부여.
   - 폴백(미지원 환경): 내부 포커서블 요소에 `tabIndex={-1}` 적용 + `aria-hidden="true"`.
   - 활성화 전환 시 위 속성은 원복합니다.

5. Loop 스크린리더 처리:
   - `loop=true`여도 `aria-label`은 논리 인덱스(1..N)를 그대로 유지합니다.
   - DOM 수준의 슬라이드 복제(cloning)는 사용하지 않습니다. 시각적 loop는 transform/scroll 위치 조작으로만 구현합니다.
   - 경계 넘김 시 별도 음성 안내(예: "처음으로 돌아갑니다")는 추가하지 않습니다.

6. Reduced Motion:
   - `prefers-reduced-motion: reduce` 감지 시 autoplay는 시작되지 않습니다.
   - 슬라이드 전환은 즉시 이동으로 폴백하며, `scrollTo` 호출은 `behavior: "auto"`를 사용합니다.

## 5. 플랫폼별 UX 요약

### 데스크톱 (마우스 · 키보드)
- **기본 네비게이션은 좌/우 핸들과 키보드**: `Carousel.PrevTrigger`/`NextTrigger`를 기본으로 렌더링하고, 키보드 사용자는 §4.1의 방향키로 동일한 결과를 얻습니다.
- **마우스 드래그는 보조 수단**: §4.2의 포인터 드래그가 마우스에서도 동작하지만, hover-only 장치(마우스만 쓰는 유저)는 핸들 클릭을 선호합니다. 드래그 지원은 핸들을 대체하지 않습니다.
- hover 시 autoplay 일시정지(`pauseOnHover=true` 기본)를 통해 컨트롤 의도 신호를 보장합니다.

### 모바일 (터치)
- 탭 타겟: `Carousel.PrevTrigger` / `Carousel.NextTrigger` / `Carousel.Indicator`의 hit area는 최소 **44×44 CSS 픽셀**을 권장. 시각적 점이 작더라도 `padding`으로 탭 타겟을 확보합니다.
- CSS `scroll-snap` 우선: `Viewport`/`Track`은 `scroll-snap-type`과 Slide의 `scroll-snap-align`을 기본 활용합니다. 관성 스크롤은 네이티브 브라우저에 위임하고, JS transform은 `scroll-snap`으로 표현 불가한 기능(loop, autoplay, 외부 `index` 동기화)에만 사용합니다. 스크롤 → 인덱스 동기화는 `IntersectionObserver`로 감지합니다.
- 세이프 에어리어: Viewport의 좌우 패딩에 `env(safe-area-inset-left)` / `env(safe-area-inset-right)` 활용을 허용/권장합니다.
- 세로 회전 대응: `ResizeObserver`로 Viewport 크기 변화를 감지하여 현재 인덱스의 스크롤 위치를 재계산합니다. `orientation="vertical"` 전환 시 Track의 `flex-direction`과 스크롤 축을 동적으로 바꿉니다.
- Autoplay는 모바일에서 특히 배터리/데이터 절약을 위해 **기본값 off**를 유지합니다. 활성화된 경우에도 §4.3의 자동 정지 규칙을 준수합니다.
