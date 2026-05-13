# ADR 0007: Slider 컴포넌트 (Slider Component)

## 1. 배경 및 문제 (Context & Problem)

수치 입력을 위한 가장 직관적인 UI 패턴인 **Slider**는 실제 제품에서 단순히 값을 변경하는 것 이상의 요구를 받습니다. 가격 필터의 범위 선택, 영상/음악 플레이어의 재생 위치, 이미지 편집의 파라미터 조정, 다크모드 밝기 슬라이더 등 유즈케이스가 매우 다양하지만, 브라우저가 기본 제공하는 `<input type="range">`는 다음과 같은 명확한 한계를 가집니다.

- **스타일 제약**: 트랙·Thumb·Range 영역을 세부 커스터마이즈하려면 `::-webkit-slider-thumb`, `::-moz-range-thumb` 등 벤더 프리픽스 의사 요소에 의존해야 하며, 브라우저별로 렌더링이 제각각입니다. 디자인 시스템이 요구하는 일관성을 보장하기 어렵습니다.
- **범위(Range) 슬라이더 불가**: `<input type="range">`는 하나의 Thumb만 지원하므로, 최소/최대 값을 함께 조절하는 가격 필터 같은 UI를 만들 수 없습니다. 두 개를 겹치는 꼼수는 접근성과 드래그 동작이 깨집니다.
- **커스텀 값 포맷팅 및 단계 제어 어려움**: "50%", "350,000원", "1h 30m" 같은 포맷을 스크린리더에 전달하기 까다롭고, `step`의 정밀 제어(예: 0.1 단위 + Shift 누르면 10 단위)도 기본 동작으로는 불가능합니다.
- **터치 성능**: 모바일에서 `<input type="range">`는 OS별 렌더링 차이가 크고, 드래그 중 페이지 스크롤이 함께 발생하거나 Thumb hit area가 부족해 손가락이 자주 벗어납니다. iOS Safari에서는 탭 하이라이트가 남는 등 시각적 결함도 많습니다.

FrameUI는 이러한 한계를 해소하면서도 **ADR 0001의 점진적 제어권 이양 원칙**을 지키는 Slider를 제공해야 합니다. 즉, 가장 흔한 "0~100 단일 값" 유즈케이스는 한 줄로 끝나되, 범위 슬라이더·커스텀 포맷·커스텀 Thumb 같은 고급 요구도 compound 분해로 막힘없이 수용해야 합니다.

## 2. 결정 (Decision)

다음 원칙으로 Slider를 설계합니다.

- **단일/범위 겸용 compound**: `Slider.Root` 하나가 `value`의 타입을 감지(`number` vs `[number, number]`)하여 단일·범위를 모두 지원합니다. 내부 Thumb 개수는 `value`의 형태에 따라 자동으로 결정됩니다. 사용자는 `Slider.Thumb`를 명시적으로 하나 또는 두 개 배치할 수 있고, 명시하지 않으면 기본 Thumb가 자동 렌더링됩니다.
- **Pointer Events 기반 입력 통합**: 마우스·터치·펜을 `MouseEvent`/`TouchEvent`로 각각 분기하지 않고 **Pointer Events**(`pointerdown`/`pointermove`/`pointerup`) 단일 이벤트 시스템으로 통합합니다. 이로써 입력 장치 분기 로직을 제거하고, `setPointerCapture`로 일관된 드래그 추적을 구현합니다.
- **`onValueChange`(매 틱) vs `onValueCommit`(종료) 분리**: 드래그 중 매 프레임 호출되는 `onValueChange`와, 사용자가 손을 떼거나 키 입력이 종료되어 "값이 확정되는 시점"에만 호출되는 `onValueCommit`을 분리합니다. 전자는 UI 피드백(미리보기, 실시간 하이라이트)에, 후자는 **서버 저장·네트워크 요청·undo 히스토리 기록**에 사용됩니다. 이는 슬라이더를 다루는 실제 앱에서 매우 중요한 성능·UX 구분입니다.
- **정수 기반 내부 계산 (부동소수 누적 오차 방지)**: 부동소수 step(예: 0.1)을 다룰 때 브라우저 `+=` 누적으로 `0.30000000000000004` 같은 오차가 쌓이는 문제를 피하기 위해, 내부에서는 **`value`를 step 단위 정수 인덱스로 치환해 계산**한 뒤 외부로 내보낼 때만 실수로 환산하는 전략을 채택합니다. 구체적으로는 `index = Math.round((value - min) / step)`로 정수화하고, 키보드·드래그 계산은 모두 `index`에 대해 수행한 뒤 `value = min + index * step`으로 복원하되 `Number.EPSILON` 기반 반올림으로 표시 오차를 추가 차단합니다.
- **완전한 WAI-ARIA Slider 패턴 준수**: 각 Thumb이 `role="slider"`, `aria-valuemin/max/now`, `aria-orientation`, `aria-valuetext`를 모두 갖추며, 범위일 때는 각 Thumb에 자동으로 `aria-label="Minimum"`, `aria-label="Maximum"`이 부여됩니다.
- **가까운 Thumb 우선 이동 (범위 모드)**: 사용자가 트랙의 임의 지점을 탭/클릭했을 때, **두 Thumb 중 해당 좌표에 더 가까운 쪽**이 해당 위치로 이동합니다. 동점(정확히 중앙)이면 마지막으로 움직였던 Thumb이 우선합니다. 이는 가격 필터 등에서 가장 자연스러운 상호작용입니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

Slider는 다른 어떤 컴포넌트보다 모바일에서의 터치 경험이 품질을 결정합니다. FrameUI Slider는 다음 모바일 원칙을 **기본 동작**으로 구현합니다.

- **Pointer Events로 터치/마우스/펜 통합**
  - `pointerdown`/`pointermove`/`pointerup`만 사용합니다. 터치-마우스 혼합 환경(윈도우 태블릿, iPad + 매직마우스)에서도 같은 코드 경로가 동작합니다.
- **Thumb hit area 최소 44×44 CSS px**
  - iOS HIG / Material Design이 권고하는 터치 타깃 최소 크기입니다. 시각적 Thumb이 16px라도, 투명한 `padding` 또는 `::before` 확장 영역으로 hit area를 44px로 키웁니다. 사용자는 눈으로 보이는 Thumb보다 훨씬 넓은 영역을 눌러도 드래그가 시작됩니다.
- **드래그 중 `touch-action`으로 페이지 스크롤 차단**
  - 가로 슬라이더는 기본적으로 `touch-action: pan-y` — 세로 스크롤은 허용하되 가로 드래그는 Slider가 가져갑니다.
  - 세로 슬라이더는 반대로 `touch-action: pan-x`.
  - 실제 드래그가 시작되면(`pointerdown` 이후) 해당 축의 스크롤도 차단해 Thumb가 "손에 붙어서" 움직이도록 합니다.
- **`setPointerCapture`로 Thumb 바깥 추적**
  - 모바일에서 손가락이 Thumb의 좁은 범위를 쉽게 벗어나는 문제를 해결합니다. `pointerdown` 시점에 `event.currentTarget.setPointerCapture(event.pointerId)`를 호출해, 손가락이 트랙 밖으로 이탈해도 동일 Thumb로 이벤트가 계속 전달됩니다.
- **haptic feedback (선택적)**
  - `navigator.vibrate`가 가용한 기기에서, step 단위를 넘어설 때마다 짧은 진동(예: 5ms)을 선택적으로 발생시킬 수 있도록 훅 지점을 남겨 둡니다. 기본은 **비활성**이며, 사용자가 필요하면 `onValueChange` 내부에서 직접 호출할 수 있습니다(FrameUI는 해당 정책을 강요하지 않습니다).
- **랜드스케이프 회전 시 안정성**
  - 트랙 DOM의 `getBoundingClientRect()`는 드래그 시작 시점 한 번이 아니라 **매 `pointermove`마다 재측정**합니다. 기기 회전·키보드 등장 등으로 레이아웃이 바뀌어도 Thumb 위치 계산이 어긋나지 않습니다.
- **iOS `-webkit-tap-highlight-color` 제거**
  - Root와 Thumb에 `-webkit-tap-highlight-color: transparent`를 기본 적용합니다. 탭 시 검/청색 사각형이 잠깐 번쩍이는 iOS 기본 동작은 슬라이더 UX에 방해가 됩니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

- **`role="slider"` 완전 준수**
  - 각 Thumb에 `role="slider"`, `tabIndex={0}` 그리고 `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-orientation`을 모두 설정합니다. 단독 `<div>` 드래그 컨트롤로 끝내지 않습니다.
- **`aria-valuetext`로 포맷된 값 제공**
  - 스크린리더가 숫자를 그대로 읽으면 "50"이라고만 발화합니다. 가격·퍼센트·시간 등은 `aria-valuetext`로 **의미 있는 문자열**(예: `"50 퍼센트"`, `"350,000 원"`, `"1시간 30분"`)을 제공하도록 `formatValue?: (v: number) => string` prop을 권장합니다.
- **범위 Thumb의 min/max 라벨 자동 부여**
  - 범위 모드에서는 두 Thumb에 각각 `aria-label="Minimum"`과 `aria-label="Maximum"`이 **자동**으로 붙습니다. 사용자는 `Slider.Thumb aria-label="..."`로 덮어쓸 수 있습니다.
- **비활성 처리**
  - `disabled={true}`이면 Root에 `data-disabled`, Thumb에 `aria-disabled="true"`가 부여되고 Pointer/Keyboard 이벤트 핸들러가 모두 NO-OP 처리됩니다. `tabIndex`도 `-1`이 되어 포커스 링에서 제외됩니다.
- **키보드 큰 스텝 구분**
  - 기본 `ArrowRight/Up`은 `±step`, `Shift+Arrow`는 `±step*10`(또는 `largeStep` prop), `PageUp/PageDown`은 큰 스텝, `Home/End`는 `min`/`max`. 작은 조정과 큰 점프를 명확히 구분합니다.
- **커밋 시점의 스크린리더 재알림**
  - `onValueCommit`이 발화되는 시점(드래그 종료·키 이벤트 종료)에 애플리케이션이 필요하면 `aria-live` 영역으로 최종 값을 다시 알릴 수 있습니다. FrameUI는 강제하지 않지만, `aria-valuetext`가 매 틱 업데이트되므로 일반적으로 충분합니다.
- **RTL에서 Arrow 방향 자동 반전**
  - `dir="rtl"`이면 `ArrowRight`이 값 **감소**, `ArrowLeft`가 **증가**로 자동 반전됩니다. `PageUp/Down`, `Home/End`는 물리적 의미가 명확하므로 반전하지 않습니다.
- **vertical 관례**
  - 수직 방향에서는 **위=증가, 아래=감소**가 기본입니다. 볼륨 슬라이더 등 특수 케이스를 위해 `inverted={true}`로 뒤집을 수 있습니다.
- **포커스 ring**
  - Thumb는 **반드시 `:focus-visible` 스타일 훅을 허용**합니다. FrameUI는 기본 스타일을 주지 않으므로, 사용자가 `data-ui="slider-thumb"`에 `:focus-visible` 스타일을 반드시 부여하도록 문서에서 권장합니다.

## 5. API 설계 (API Design)

### 5.1. Root Props

| Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `value` | `number \| [number, number]` | — | 제어 모드. 튜플이면 범위 슬라이더로 전환. |
| `defaultValue` | `number \| [number, number]` | `0` | 비제어 모드 초기값. |
| `onValueChange` | `(value) => void` | — | 드래그·키 입력 **매 틱**마다 호출. 실시간 UI 피드백 용도. |
| `onValueCommit` | `(value) => void` | — | `pointerup` / `keyup` 시점 1회 호출. **서버 저장** 용도. |
| `min` | `number` | `0` | |
| `max` | `number` | `100` | |
| `step` | `number` | `1` | 부동소수 허용. 내부적으로 정수 인덱스로 치환. |
| `minStepsBetweenThumbs` | `number` | `0` | 범위 모드에서 두 Thumb 사이 최소 step 거리. |
| `largeStep` | `number` | `step * 10` | Shift+Arrow / PageUp·Down의 이동량. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | |
| `dir` | `"ltr" \| "rtl"` | `"ltr"` | |
| `inverted` | `boolean` | `false` | 축 방향 뒤집기. |
| `disabled` | `boolean` | `false` | |
| `formatValue` | `(v: number) => string` | — | `aria-valuetext` 생성 함수. |

### 5.2. `onValueChange` vs `onValueCommit` 호출 시점

| 사건 | `onValueChange` | `onValueCommit` |
|---|---|---|
| `pointerdown` (즉시 트랙 클릭) | 호출 | **호출 X** (드래그일 수 있으므로 대기) |
| `pointermove` (드래그 중) | 호출 (매 틱) | 호출 X |
| `pointerup` | 호출 X (값 미변경) | **호출** |
| `keydown`(Arrow/Page/Home/End) | 호출 | 호출 X |
| `keyup` (값 변경이 있었으면) | 호출 X | **호출** |

이 분리 덕분에, **드래그 중에는 로컬 state만 갱신**하고 `onValueCommit`에서 한 번만 서버 PATCH를 보내는 패턴이 자연스럽게 구현됩니다.

### 5.3. CSS 변수 노출

Root와 Range는 **인라인 CSS 변수**로 현재 값 비율을 노출합니다. 사용자는 이것만으로 트랙 채움·그라디언트·색 전환 등을 스타일링할 수 있습니다.

- `--value-start`: 범위의 시작 비율 (0~1). 단일 모드에선 `0`.
- `--value-end`: 현재 값 또는 범위의 끝 비율 (0~1).

예: `background: linear-gradient(to right, var(--accent) calc(var(--value-start) * 100%), transparent 0);`

### 5.4. data 속성

- `Slider.Root`: `data-ui="slider"`, `data-orientation`, `data-disabled`
- `Slider.Track`: `data-ui="slider-track"`
- `Slider.Range`: `data-ui="slider-range"` (`--value-start`, `--value-end` 인라인 적용)
- `Slider.Thumb`: `data-ui="slider-thumb"`, `data-disabled`, `data-index="0" | "1"`

### 5.5. 내부 값 계산 전략 (부동소수 오차 방지 상세)

```ts
// 개념 예시 — 실제 구현은 내부 helper로 캡슐화
function toIndex(value: number, min: number, step: number) {
  return Math.round((value - min) / step);
}

function fromIndex(index: number, min: number, step: number) {
  // step * index를 그대로 더하면 0.1 + 0.1 + 0.1 !== 0.3 문제가 재발하므로,
  // 소수점 자릿수를 step에서 추출해 고정 자릿수로 반올림한다.
  const decimals = (String(step).split(".")[1] ?? "").length;
  const raw = min + index * step;
  return Number(raw.toFixed(decimals));
}
```

드래그 중 `pointermove`에서도 먼저 비율 → index → value 순으로 환산하므로, 아무리 오래 드래그해도 `value`가 `0.30000000000000004` 형태로 새어 나가지 않습니다.

## 6. 사용 예시 (Usage Examples)

### 6.1. 단일 기본 (1단계: Prop 기반)

```tsx
// 기본: 0~100 단일 값. compound를 꺼낼 필요 없이 한 줄로 끝납니다.
import { Slider } from "frame-ui";
import { useState } from "react";

export default function VolumeSlider() {
  const [volume, setVolume] = useState(40);

  return (
    <Slider
      value={volume}
      onValueChange={setVolume}
      onValueCommit={(v) => saveVolumeToServer(v)}
      min={0}
      max={100}
      step={1}
      aria-label="볼륨"
      formatValue={(v) => `${v} 퍼센트`}
    />
  );
}
```

### 6.2. 범위 compound + 커스텀 Thumb 라벨 (2단계: 점진적 확장)

```tsx
// 가격 필터: 범위 슬라이더 + 커스텀 Thumb 내부 라벨.
import { Slider } from "frame-ui";
import { useState } from "react";

export default function PriceRange() {
  const [range, setRange] = useState<[number, number]>([100_000, 500_000]);
  const format = (v: number) => `${v.toLocaleString("ko-KR")} 원`;

  return (
    <Slider.Root
      value={range}
      onValueChange={setRange}
      onValueCommit={(r) => applyFilter(r)}
      min={0}
      max={1_000_000}
      step={10_000}
      minStepsBetweenThumbs={1}
      formatValue={format}
      aria-label="가격 범위"
    >
      <Slider.Track className="track">
        <Slider.Range className="range" />
      </Slider.Track>

      <Slider.Thumb className="thumb" aria-label="최소 가격">
        <span className="thumb-label">{format(range[0])}</span>
      </Slider.Thumb>
      <Slider.Thumb className="thumb" aria-label="최대 가격">
        <span className="thumb-label">{format(range[1])}</span>
      </Slider.Thumb>
    </Slider.Root>
  );
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

- **`<input type="range">` 두 개 겹치기 (range 모드용)**
  - 장점: 브라우저 네이티브 접근성·키보드 지원을 거의 그대로 활용.
  - 단점: 두 Thumb이 겹칠 때 z-index로 "항상 가까운 쪽이 잡힌다"를 구현하기 어렵고, Thumb 커스텀 스타일링의 벤더별 차이가 여전하며, `step` 커밋 제어와 `aria-valuetext` 주입이 까다롭습니다. **기각**.
- **`react-slider`, `rc-slider` 등 외부 라이브러리 채택**
  - 장점: 검증된 동작.
  - 단점: 스타일링 자유도가 라이브러리 내부 class·구조에 묶이고, FrameUI의 `asChild` / compound 규약과 충돌합니다. 번들 크기와 의존성도 FrameUI의 "headless + zero-dep" 철학과 맞지 않습니다. **기각**.
- **자체 `MouseEvent` + `TouchEvent` 기반 구현**
  - 장점: Pointer Events 미지원 구형 브라우저 대응 가능.
  - 단점: 코드 경로가 2~3배로 늘고, 펜 입력은 별도 처리가 필요하며, 터치-마우스 혼합 환경에서 미묘한 버그가 잘 발생합니다. 타겟 브라우저(최신 Evergreen + iOS/Android 모바일)에서 Pointer Events는 이미 보편 지원이므로 **기각**.

## 8. 결과 (Consequences)

### Positive
- 단일/범위 슬라이더를 **동일한 컴포넌트**로 모두 처리하며, 사용자는 `value` 타입만 바꾸면 됩니다.
- `onValueChange` / `onValueCommit` 분리로 실시간 UI와 네트워크 비용을 쉽게 분리할 수 있어 **성능·UX가 동시에 개선**됩니다.
- Pointer Events + `setPointerCapture` + `touch-action` 조합으로 **모바일 드래그가 끊김·스크롤 충돌 없이** 동작합니다.
- `aria-valuetext`, 범위 min/max 라벨, RTL, vertical, `inverted`, 키보드 단계 구분까지 **접근성 요구를 빠짐없이** 충족합니다.
- step 누적 오차를 **정수 인덱스 치환**으로 근본 차단합니다.

### Negative
- Pointer Events는 최신 브라우저에선 표준이지만, **브라우저별 미묘한 편차**가 존재합니다. 특히 iOS Safari의 `pointercancel` 타이밍, 일부 Android WebView의 `setPointerCapture` 동작은 개별 검증이 필요합니다.
- compound 구조가 깊어지면서(`Root > Track > Range`, `Thumb` 별도) 최초 사용자가 구조를 익히는 데 약간의 학습 비용이 발생합니다. 이는 1단계 Prop 모드로 완화합니다.
- `formatValue`를 제공하지 않으면 `aria-valuetext`가 기본 숫자만 반환하므로, 단위가 있는 슬라이더에서 사용자에게 **문서적으로** 포맷 지정을 강하게 권고해야 합니다.

### Ongoing
- **터치 성능 테스트**: 저사양 Android 기기(예: Chromebook Tab) 및 iOS Safari에서 60fps 드래그 유지 여부, 긴 리스트 안에 슬라이더가 포함됐을 때의 스크롤 충돌을 실기기로 반복 검증합니다.
- **접근성 테스트**: VoiceOver(iOS/macOS), TalkBack(Android), NVDA(Windows)에서 단일·범위 모드, vertical, RTL 조합의 발화 내용을 정기적으로 회귀 테스트합니다.
- **Pointer Events 회귀**: 주요 브라우저 업데이트(특히 WebKit) 때마다 `setPointerCapture`/`pointercancel` 시나리오를 재검증합니다.
