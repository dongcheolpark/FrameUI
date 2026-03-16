# ADR 0001: FrameUI 비전 및 포지셔닝 (Vision & Positioning)

## 1. 배경 및 현상 (Context & Problem)

React 생태계에서 디자인(스타일)과 상태 로직을 분리하는 'Headless UI' 패턴은 이제 표준으로 자리 잡고 있습니다. 하지만 현재 시장을 주도하는 두 가지 대표적인 라이브러리는 각각의 명확한 장단점과 한계를 가지고 있어, 개발자들에게 피로도나 아쉬움을 유발하고 있습니다.

- **Radix UI의 문제점 (과도한 보일러플레이트와 복잡성)**
  - 접근성(WAI-ARIA)과 컴포넌트의 논리적 분할이 매우 뛰어나지만, API가 극도로 세분화(Primitive)되어 있습니다.
  - 단순한 모달(Dialog)이나 드롭다운을 하나 만들기 위해서도 `Root`, `Trigger`, `Portal`, `Overlay`, `Content` 등 너무 많은 컴포넌트를 import 하고 결합해야 합니다.
  - 이는 초기 학습 곡선을 높이고, 코드 베이스를 비대하게 만듭니다.

- **Tailwind Headless UI의 문제점 (확장성의 한계)**
  - API가 직관적이고 보일러플레이트가 적어 빠르게 구현하기 좋습니다.
  - 하지만 요구사항이 복잡해져서 세밀한 커스텀(예: 키보드 네비게이션 방식 튜닝, 특정 애니메이션 생명주기에 맞춘 상태 제어 등)이 필요할 때, 프레임워크가 제공하는 API의 한계에 부딪히게 됩니다.
  - 내부 로직에 개입하기 어려워 결국 라이브러리를 포기하고 직접 구현해야 하는 상황이 발생하기도 합니다.

## 2. FrameUI의 지향점 (Vision: The Sweet Spot)

FrameUI는 **Radix의 "견고함(접근성과 제어권)"과 Headless UI의 "단순함(직관적 API)" 사이의 완벽한 중간 지점(Sweet Spot)**을 타겟팅합니다.

우리의 핵심 설계 철학은 **점진적 제어권 이양(Progressive Inversion of Control)**입니다.

- **Default는 심플하게**: 일반적인 유즈케이스에서는 Headless UI처럼 최소한의 코드로 즉시 동작하는 직관적인 API를 제공합니다. 개발경험(DX)을 극대화합니다.
- **필요할 때는 강력하게**: 복잡한 커스텀이 필요한 순간에는, Radix처럼 내부 상태와 하위 컴포넌트(Compound Components)에 직접 접근하여 로직을 덮어쓰거나 무효화할 수 있는 '탈출구(Escape Hatch)'를 제공합니다.
- 스타일링의 자유도와 WAI-ARIA 기반의 접근성 준수는 타협하지 않는 기본 원칙으로 가져갑니다.

## 3. 전략: 스윗스팟을 달성하는 방법 (Strategy)

로우레벨 훅(Hook)을 노출하는 대신, **점진적 컴포넌트 확장 (Progressive Component Disclosure)** 패턴을 도입하여 '단순함'과 '강력함'의 딜레마를 해결합니다. 평소에는 코드 1줄로 끝낼 만큼 단순하게, 필요할 때만 컴포넌트를 분해(Compound Components)할 수 있도록 설계합니다.

1. **단일 컴포넌트를 통한 점진적 확장**
   - **기본 모드 (Prop 기반):** 가장 흔한 유즈케이스는 `title`, `description`, `trigger` 등의 Prop을 주입하여 보일러플레이트를 최소화합니다.
   - **확장 모드:** 복잡한 레이아웃이나 애니메이션이 필요할 때, Compound Component(합성 컴포넌트) 형태로 세부 요소들을 꺼내어 재조립합니다.
2. **최신 React와 렌더링 최적화**
   - React 19+ 환경을 타겟팅하여 불필요한 `forwardRef` 없이 깨끗한 API를 유지합니다.
   - 내부의 Context API와 Prop Sniffing(Prop 감지)을 통해 루트(`<Dialog>`)가 어떤 모드로 렌더링될지 스마트하게 결정합니다.
3. **`asChild` (Slot) 패턴을 통한 스타일링 제어권**
   - FrameUI가 제공하는 기본 마크업 요소(`<button>`, `<div>` 등)에 종속되지 않고, 사용자가 만든 커스텀 컴포넌트에 접근성(ARIA)과 이벤트 속성만 완벽하게 융합(Merge)시킬 수 있는 `asChild` 속성을 제공합니다.

## 4. 가상의 API 비교 (API Comparison)

동일한 `Dialog(Modal)` 컴포넌트를 구현할 때의 코드 베이스 차이를 통해 FrameUI의 포지셔닝을 확인합니다.

### 4.1. Radix UI (견고하지만 장황함)

```tsx
// 세분화되어 강력하지만, Portal과 Overlay 등을 매번 명시해야 하는 보일러플레이트가 존재합니다.
import * as Dialog from "@radix-ui/react-dialog";

export default function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="content">
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### 4.2. FrameUI - 1단계: 진정한 기본 모드 (Prop 기반)

```tsx
// 복잡한 태그 없이, 가장 직관적이고 빠르게 구현합니다. 내부적으로 Portal과 Overlay는 자동 처리됩니다.
import { Dialog } from "frame-ui";

export default function MyDialog() {
  return (
    <Dialog
      trigger={<button>Open</button>}
      title="프로필 수정"
      description="개인 정보를 수정하세요."
    >
      <ProfileForm />
    </Dialog>
  );
}
```

### 4.3. FrameUI - 2단계: 점진적 확장 모드 (asChild & Compound)

```tsx
// 디자인 요구사항이 복잡해졌을 때, 로우레벨 훅 대신 내부 요소를 분해해서 사용합니다.
import { Dialog } from "frame-ui";

export default function CustomDialog() {
  return (
    <Dialog>
      {/* asChild 패턴: 버튼 껍데기를 버리고 내 커스텀 버튼에 속성을 융합합니다. */}
      <Dialog.Trigger asChild>
        <MyCustomButton className="custom-btn">Open Custom</MyCustomButton>
      </Dialog.Trigger>

      <Dialog.Content className="my-custom-modal-layout">
        <div className="flex justify-between">
          <Dialog.Title>프로필 수정</Dialog.Title>
          <Dialog.CloseButton>X</Dialog.CloseButton>
        </div>
        <ProfileForm />
      </Dialog.Content>
    </Dialog>
  );
}
```
