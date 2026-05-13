# ADR 0004: Toast 컴포넌트 (Toast Notification Component)

## 1. 배경 및 문제 (Context & Problem)

Toast(일시 알림)는 겉보기에는 단순해 보이지만, 실제로 제대로 구현하려면 접근성, 타이밍, 스택 관리, 모바일 레이아웃까지 얽힌 매우 까다로운 컴포넌트입니다. 많은 프로젝트에서 자체 구현한 Toast가 반복적으로 아래와 같은 문제를 일으키는 것을 관찰했습니다.

- **접근성 부재**
  - 스크린 리더 사용자에게 알림이 전혀 전달되지 않거나, 반대로 모든 알림을 `role="alert"`로 찍어 사용자의 작업 흐름을 폭력적으로 가로챕니다.
  - 포커스를 빼앗는 구현(예: `role="alertdialog"` 강제)이 백그라운드성 정보 전달에까지 무분별하게 적용됩니다.

- **자동 닫힘과 읽기 속도의 충돌**
  - 메시지 길이와 무관한 고정 duration(예: 3초)을 사용하면, 긴 문장은 사용자가 다 읽기도 전에 사라집니다.
  - hover/focus 중에도 타이머가 계속 흘러 사용자가 액션 버튼에 도달하기 전에 Toast가 사라집니다.
  - 탭 전환(`document.hidden`)이나 창 blur 상태에서도 타이머가 돌아 사용자가 돌아왔을 때 이미 사라진 알림을 마주하게 됩니다.

- **스택 폭발(Stack Explosion)**
  - 네트워크 재시도 루프나 스팸성 호출로 동일한 Toast가 수십 개 쌓여 화면을 가립니다.
  - 동일 이벤트에 대한 중복 알림이 별도의 노드로 누적됩니다.

- **모바일 레이아웃 문제**
  - 하단 배치 시 iOS 홈 인디케이터나 하단 탭바, 시스템 제스처 영역과 겹쳐 터치가 먹히지 않거나 알림이 가려집니다.
  - 상단 배치 시 노치/상태 표시줄과 겹칩니다.
  - 가로 모드에서는 좌우 가장자리까지 늘어난 Toast가 오히려 읽기 힘들어집니다.

FrameUI는 ADR 0001의 **점진적 제어권 이양(Progressive Inversion of Control)** 철학에 따라, 기본값만으로도 위 문제를 전부 회피하되 필요하면 완전히 분해할 수 있는 Toast를 제공해야 합니다.

## 2. 결정 (Decision)

FrameUI는 Toast를 다음과 같이 설계합니다.

- **Provider + Viewport + Compound Root** 구조를 채택합니다. `Toast.Provider`가 스택 상태와 타이머를 전역 관리하고, `Toast.Viewport`가 실제 렌더 포털 역할을 하며, `Toast.Root`가 개별 토스트의 compound 컨테이너입니다.
- **두 가지 진입점을 동등하게 지원합니다.**
  - 선언형 `<Toast.Root open={...}>` (Controlled) — ADR 0001의 Switch/Tabs와 동일하게 `defaultOpen`을 통한 Uncontrolled도 허용.
  - 명령형 `toast(...)` / `toast.success(...)` / `toast.error(...)` / `toast.dismiss(id)` — 이벤트 핸들러 내부에서 JSX 없이 즉시 호출.
- **`type` prop으로 ARIA 역할을 자동 결정합니다.** `type="foreground"`는 `role="alertdialog"` + `aria-live="assertive"`, `type="background"`(기본)는 `role="status"` + `aria-live="polite"`를 적용합니다. 사용자가 실수하지 않도록 prop 이름 자체가 의미를 설명하도록 했습니다.
- **`data-ui`, `data-state`, `data-swipe-direction`, `data-type` 속성**을 통해 완전 unstyled를 유지하면서 CSS로 애니메이션을 연결할 수 있게 합니다.
- **imperative API는 `useToast()` 훅으로도 노출**합니다. 모듈 레벨 싱글턴(`toast()`)은 편리하지만 React 19 strict mode의 이중 마운트, SSR 격리, 테스트 환경에서의 상태 누수 때문에 위험합니다. FrameUI에서는 Provider에 바인딩된 `useToast()`가 권장 경로이며, 모듈 레벨 `toast()` 함수는 가장 가까운 마운트된 Provider로 라우팅되는 얇은 어댑터로만 제공합니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

Toast는 데스크톱과 모바일에서 요구사항이 가장 크게 갈리는 컴포넌트이므로, 다음 원칙을 **기본값**에 내장합니다.

- **Safe-area inset 자동 반영**
  - `Toast.Viewport`는 자체 스타일을 갖지 않지만, `data-position="bottom"` 같은 data 속성을 노출해 사용자가 CSS로 `padding: max(16px, env(safe-area-inset-bottom))`을 적용할 수 있도록 가이드합니다.
  - 문서와 스타일 예제는 반드시 `env(safe-area-inset-*)`을 포함한 형태로 제공합니다. iOS 홈 인디케이터, 노치, 안드로이드 제스처 바와의 충돌을 원천 차단하는 것이 목적입니다.

- **스와이프 dismiss는 1차 제스처**
  - `Toast.Provider`의 `swipeDirection` prop(기본 `"right"`)에 따라 터치 스와이프로 Toast를 닫을 수 있어야 합니다.
  - `data-swipe="start" | "move" | "end" | "cancel"`과 `--frame-swipe-move-x/y` CSS 변수로 사용자가 transform 애니메이션을 직접 연결합니다.
  - 모바일에서는 키보드 포커스 점프(F6)의 실효성이 낮기 때문에, **터치 dismiss 제스처가 주 경로**이고 키보드 경로는 보조입니다.

- **스택 개수 제한(`limit`)**
  - 데스크톱은 기본 `limit={5}` 정도가 합리적이지만, 모바일 세로 모드에서는 Toast 3개만 쌓여도 화면의 상당 부분이 가려집니다. 따라서 **기본값은 3**으로 정하고, 초과분은 큐에 보관하다가 앞 항목이 dismiss되면 자리를 양보하도록 합니다.
  - 동일 `id`의 Toast가 다시 호출되면 새 노드를 추가하지 않고 기존 노드를 **업데이트**합니다(duplicate 방지).

- **터치 타겟 ≥ 44×44**
  - `Toast.Close`, `Toast.Action`은 unstyled이지만, 문서/데모에서는 최소 44×44 CSS px의 터치 영역을 권장합니다. 작은 X 아이콘을 그대로 노출하는 안티패턴을 막기 위해 데모 스타일 예제에 명시합니다.

- **가로 모드 / 태블릿 고려**
  - 가로 모드에서 Viewport가 화면 전폭을 차지하면 시선 이동이 커지고 읽기 어렵습니다. 예제 CSS에서 `max-width: min(420px, calc(100vw - 32px))`를 기본값으로 제안하고, 태블릿에서는 화면 중앙 정렬도 대안으로 소개합니다.

- **모바일 키보드 경로의 한계 명시**
  - 가상 키보드 환경에서는 F6 포커스 점프가 의미가 없습니다. FrameUI는 keyboard shortcut을 `hotkey` prop으로 커스터마이즈하게 하되, 모바일 대응은 **스와이프 + 탭으로 닫기**를 1급 경로로 문서화합니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

- **`role="status"` vs `role="alertdialog"` 선택 기준**
  - `type="background"` (기본): 저장 완료, 복사됨, 백그라운드 동기화 같은 **비차단(non-blocking) 정보**. `role="status"` + `aria-live="polite"`로 사용자의 현재 작업을 방해하지 않습니다.
  - `type="foreground"`: 사용자의 즉각적인 주의와 응답이 필요한 **차단성 알림**(네트워크 연결 끊김 + 재시도 버튼, 세션 만료 경고 등). `role="alertdialog"` + `aria-live="assertive"`이며, 내부 포커스 트랩과 action/close 버튼을 필수로 요구합니다.
  - 잘못된 역할 선택을 줄이기 위해 `type` prop 기본값은 `"background"`이며, `action` 자식이 없음에도 `type="foreground"`를 지정하면 dev 모드에서 경고합니다.

- **자동 닫힘 duration 가이드**
  - 단일 상수 duration은 메시지 길이를 고려하지 못합니다. FrameUI는 기본 `duration`을 `5000ms`로 두되, 문서와 유틸에서 **`5000ms + 50ms × 문자 수`(상한 10s)**를 권장 공식으로 제시합니다.
  - `duration={Infinity}`는 수동 닫기 전용으로 정의하며, 이 경우 `Toast.Close` 또는 `Toast.Action` 중 하나가 반드시 존재해야 한다고 dev 경고를 냅니다.

- **타이머 일시정지 규칙**
  - Viewport가 `:hover` 또는 내부에 `:focus-visible`을 가지는 동안 모든 Toast 타이머를 일시정지, 벗어날 때 재개합니다.
  - `document.visibilityState === "hidden"` 상태에서는 타이머를 멈추고, `visibilitychange`로 복귀 시 남은 시간부터 재개합니다. 탭을 전환한 사이에 Toast가 사라져 있는 경험을 제거합니다.
  - `window.blur`도 동일하게 처리합니다(포커스 이동으로 알림을 놓치는 경우 방지).
  - `matchMedia("(prefers-reduced-motion: reduce)")`가 true면 슬라이드/페이드 애니메이션을 즉시 완료 상태로 렌더하고, `data-reduced-motion=""`을 Viewport에 부여합니다.

- **스팸 방지(Duplicate Collapse)**
  - `toast({ id: "save" })`처럼 동일 id가 호출되면 기존 토스트를 제자리에서 업데이트하고, duration도 리셋합니다. 동일 네트워크 오류가 10회 재시도되어도 카드는 1개만 유지됩니다.

- **포커스 관리**
  - Toast dismiss 시점에, 이전에 포커스를 가지고 있던 요소로 **포커스를 되돌립니다**. `type="foreground"`가 포커스를 탈취한 경우에 특히 중요합니다.
  - `type="background"`는 절대 포커스를 가로채지 않습니다.

## 5. API 설계 (API Design)

### 5.1. `Toast.Provider` Props

| Prop             | Type                                            | Default  | 설명                                                                                |
| ---------------- | ----------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `duration`       | `number`                                        | `5000`   | Root가 별도 지정하지 않을 때 사용되는 기본 자동 닫힘 시간(ms). `Infinity` 허용.     |
| `swipeDirection` | `"right" \| "left" \| "up" \| "down"`           | `"right"`| 터치 스와이프로 dismiss되는 방향.                                                   |
| `swipeThreshold` | `number`                                        | `50`     | dismiss로 간주되는 이동 거리(px).                                                   |
| `limit`          | `number`                                        | `3`      | 동시에 보이는 최대 개수. 초과분은 큐에 대기.                                        |
| `hotkey`         | `string[]`                                      | `["F6"]` | Viewport로 포커스를 점프시키는 단축키.                                              |
| `label`          | `string`                                        | `"Notifications"` | Viewport `aria-label`.                                                      |

### 5.2. `Toast.Root` Props

| Prop           | Type                                | Default        | 설명                                                                |
| -------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------- |
| `open`         | `boolean`                           | —              | Controlled 오픈 상태.                                               |
| `defaultOpen`  | `boolean`                           | `true`         | Uncontrolled 초기 상태.                                             |
| `onOpenChange` | `(open: boolean) => void`           | —              | open 상태 변경 콜백.                                                |
| `duration`     | `number`                            | Provider 상속  | 해당 Toast의 자동 닫힘 시간(ms). `Infinity` 허용.                   |
| `type`         | `"foreground" \| "background"`      | `"background"` | ARIA 역할과 live region 강도를 결정.                                |
| `priority`     | `"high" \| "low"`                   | `"low"`        | 스택 정렬. `high`는 항상 상단/전면.                                 |
| `id`           | `string`                            | auto           | 동일 id 중복 호출 시 업데이트 대상.                                 |

모든 서브컴포넌트(`Title`, `Description`, `Action`, `Close`)는 Tabs/Switch와 동일하게 `data-ui="toast-*"`, `data-state="open" | "closed"`, `data-type`, `data-swipe`, `data-disabled` 속성을 노출합니다.

### 5.3. Imperative API

```tsx
// 모듈 레벨 어댑터 (가장 가까운 Provider로 라우팅)
toast(message: ReactNode | ToastOptions): string;
toast.success(message, options?): string;
toast.error(message, options?): string;
toast.dismiss(id?: string): void;
toast.update(id: string, options: ToastOptions): void;

// Provider에 바인딩된 hook (권장)
const { toast, dismiss, update } = useToast();
```

`ToastOptions`는 `{ id?, title?, description?, action?, duration?, type?, priority?, onOpenChange? }`입니다. `toast()`는 생성된 id를 반환하며, `dismiss(id)`로 명시적 제거가 가능합니다.

### 5.4. 이벤트 콜백 순서

1. `onOpenChange(true)` — 마운트 직후 1회.
2. (타이머 경과 또는 사용자 제스처) `onOpenChange(false)` — dismiss 요청.
3. 애니메이션 종료(또는 reduced-motion 즉시) 후 DOM 언마운트.

이 순서는 사용자가 CSS transition을 걸어도 상태가 어긋나지 않도록 보장합니다.

## 6. 사용 예시 (Usage Examples)

### 6.1. 1단계: Provider 설치 + imperative `toast()` 호출

```tsx
// 대부분의 케이스는 이 정도로 끝납니다. 스타일은 unstyled 원칙대로 사용자가 CSS로 입힙니다.
import { Toast, useToast } from "frame-ui";

function Root() {
  return (
    <Toast.Provider swipeDirection="right" limit={3}>
      <App />
      <Toast.Viewport className="toast-viewport" />
    </Toast.Provider>
  );
}

function SaveButton() {
  const { toast } = useToast();
  return (
    <button
      onClick={async () => {
        await saveProfile();
        toast.success({ title: "저장됨", description: "프로필이 업데이트되었습니다." });
      }}
    >
      저장
    </button>
  );
}
```

### 6.2. 2단계: 점진적 확장 — Compound 커스텀

```tsx
// 네트워크 오류처럼 사용자 응답이 필요한 경우: foreground로 승격하고 Action/Close를 직접 조립합니다.
import { Toast } from "frame-ui";

export function OfflineToast({ open, onOpenChange, onRetry }: Props) {
  return (
    <Toast.Root
      open={open}
      onOpenChange={onOpenChange}
      type="foreground"
      duration={Infinity}
      priority="high"
      className="toast offline"
    >
      <Toast.Title className="toast-title">연결이 끊어졌습니다</Toast.Title>
      <Toast.Description className="toast-desc">
        네트워크를 확인한 뒤 다시 시도해 주세요.
      </Toast.Description>
      <div className="toast-actions">
        <Toast.Action altText="다시 시도" onClick={onRetry}>
          다시 시도
        </Toast.Action>
        <Toast.Close aria-label="닫기">✕</Toast.Close>
      </div>
    </Toast.Root>
  );
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

- **`react-hot-toast` / `sonner` 래핑**
  - 장점: 구현 비용이 거의 없고 성숙한 제스처/애니메이션 지원.
  - 단점: FrameUI의 "unstyled + asChild + compound" 계약과 어긋납니다. 두 라이브러리 모두 기본 스타일과 DOM 구조를 강제하며, 래퍼 계층이 asChild 패턴을 파괴합니다. 또한 의존성이 늘어나 번들 사이즈와 API 표면 일관성이 깨집니다.

- **`window.alert` / `confirm`**
  - 장점: 코드 0줄.
  - 단점: 비동기 UI와 통합 불가, 스타일 불가, 모바일에서 치명적 UX, 스크린 리더 처리 불균일. 논의 가치가 없습니다.

- **자체 구현 (채택)**
  - 장점: Switch/Tabs와 동일한 Controlled/Uncontrolled 패턴, `data-*` 계약, asChild 호환을 그대로 이어갈 수 있습니다. Viewport/스택/타이머를 우리 방식으로 통제합니다.
  - 단점: 스와이프 제스처, reduced-motion, safe-area, focus restoration 등 접근성/UX 디테일을 직접 검증해야 합니다. 테스트 부담이 가장 큰 컴포넌트가 될 것입니다.

- **모듈 레벨 싱글턴 `toast()`만 제공 (react-hot-toast 방식) — 비채택**
  - React 19 strict mode의 이중 마운트, 다중 Provider, SSR 격리, Vitest happy-dom 환경에서 상태가 누수될 위험이 큽니다. FrameUI는 `useToast()`를 권장 경로로 두고, 모듈 `toast()`는 "가장 가까운 마운트된 Provider로 디스패치"하는 얇은 어댑터로만 제공합니다.

## 8. 결과 (Consequences)

### Positive

- 가장 흔한 유즈케이스는 `toast.success({ title })` 한 줄로 끝납니다. ADR 0001의 "Default는 심플하게" 원칙 달성.
- 복잡한 요구사항(커스텀 레이아웃, action, foreground alertdialog)은 compound로 완전히 분해 가능합니다. "필요할 때는 강력하게" 충족.
- `type` prop 하나로 ARIA 역할이 정해지므로 사용자가 `aria-live`를 수동으로 기억할 필요가 없습니다.
- `data-*` 계약이 Switch/Tabs와 동일하여 기존 FrameUI CSS 가이드를 그대로 재사용합니다.
- safe-area, reduced-motion, 탭 hidden, duplicate collapse가 기본 동작에 내장되어 접근성/모바일 실수를 구조적으로 차단합니다.

### Negative

- Provider 전역 상태에 의존하므로, 여러 개의 Provider를 중첩했을 때 모듈 레벨 `toast()`가 어느 Provider로 라우팅되는지 **문서로 명확히 설명**해야 합니다(기본: 가장 늦게 마운트된 Provider).
- React 19 strict mode의 이중 마운트에서 타이머가 중복 생성되지 않도록, Provider 내부의 타이머 등록/해제는 `useEffect` cleanup을 엄격히 지켜 구현해야 합니다. Vitest + happy-dom 테스트에서 시간 관련 flake가 가장 많이 발생할 것으로 예상됩니다.
- 스와이프 제스처는 Pointer Events 기반으로 구현하되, Safari iOS의 스크롤 제스처와 충돌하지 않도록 `touch-action: pan-y` 등 CSS 힌트가 필요합니다 — 이 부분은 사용자 스타일에 의존하므로 문서화가 필수입니다.

### Ongoing

- iOS Safari 16/17/18, 안드로이드 Chrome, iPad Safari에서의 safe-area 및 스와이프 동작을 실기 테스트로 지속 검증합니다.
- `prefers-reduced-motion`과 `document.visibilityState` 조합에 대한 회귀 테스트를 추가합니다.
- imperative API의 "가장 가까운 Provider" 라우팅 정책이 SSR(RSC) 환경에서 어떻게 동작해야 하는지는 별도 ADR로 추적합니다.
- 향후 `Toast.Root`에 `asChild` 지원을 추가해 Switch/Tabs와 동일한 Slot 기반 DOM 대체를 완성합니다.
