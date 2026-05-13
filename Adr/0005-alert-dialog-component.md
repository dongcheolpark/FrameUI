# ADR 0005: AlertDialog 컴포넌트 (Alert Dialog Component)

## 1. 배경 및 문제 (Context & Problem)

FrameUI는 현재 일반 목적의 `Dialog` 컴포넌트를 설계/구현하고 있습니다(선행 작업). Dialog는 프로필 편집, 상세 조회, 긴 폼 입력 등 "사용자가 집중해서 작업해야 하는 맥락"을 위한 범용 모달입니다. 따라서 기본 동작은 다음과 같습니다.

- Overlay 클릭 시 닫힘(바깥 영역을 누르면 빠져나온다는 관례)
- Esc 키 닫힘
- 초기 포커스는 Content 내부 첫 번째 포커서블 요소 또는 Content 자체

그런데 제품을 만들다 보면 "되돌릴 수 없는 행동을 하기 전 사용자의 의사를 한 번 더 확인하는" 맥락이 반복해서 등장합니다. 대표적으로 계정 삭제, 게시글 삭제, 결제 취소, 진행 중이던 폼 이탈 등이 있습니다. 이 경우 일반 `Dialog`를 그대로 재사용하면 다음과 같은 UX/접근성 문제가 발생합니다.

1. **Overlay 클릭으로 닫힘 → 실수 확인(false confirm) 위험**
   일반 Dialog는 바깥 클릭으로 "취소(dismiss)"하는 것이 자연스럽지만, 확인 다이얼로그의 바깥 클릭이 "취소"인지 "아무것도 하지 않음"인지 불명확합니다. 실무에서는 대개 사용자가 Cancel/Action 중 하나를 명시적으로 선택하게 강제하는 편이 안전합니다.

2. **초기 포커스가 Action 쪽에 잡히면 Enter 한 번으로 파괴적 작업이 실행됨**
   스크린리더 사용자와 키보드 사용자가 모달을 열자마자 Enter를 누르는 습관이 있을 수 있는데, 일반 Dialog처럼 "첫 포커서블 요소" 규칙을 그대로 적용하면 삭제가 바로 실행되어 복구 불가능한 상태가 될 수 있습니다.

3. **`role="dialog"`와 `role="alertdialog"`의 의미 구분 부재**
   WAI-ARIA는 "사용자의 즉각적인 응답이 필요한 모달"에 대해 별도의 `alertdialog` 역할을 정의합니다. 일반 Dialog가 이 역할까지 떠맡으면, 스크린리더가 컨텍스트를 정확하게 전달하지 못합니다.

4. **API 수준의 혼동**
   Dialog에 "확인 다이얼로그 모드"를 조건부로 꽂으면, 하나의 컴포넌트가 두 가지 이질적인 기본값(닫힘 규칙·초기 포커스·role)을 가져야 합니다. 이는 내부 분기 복잡도를 올리고, 사용자의 IDE 자동완성에도 혼란을 유발합니다.

즉, "확인/취소 두 선택지만 의미 있는 모달"은 **일반 Dialog와는 기본값이 반대로 꺾여야 하는 별개의 의미론**을 갖는다는 것이 핵심 문제입니다.

## 2. 결정 (Decision)

우리는 `AlertDialog`를 **별도의 최상위 컴포넌트**로 분리합니다.

- 의미론: Content에 `role="alertdialog"`를 강제합니다(일반 Dialog와의 유일한 런타임 차이).
- 닫힘 규칙: Overlay 클릭으로는 닫히지 않습니다. 닫힘은 Cancel 또는 Action을 통해서만 일어나도록 기본값을 뒤집습니다. Esc 키는 옵션으로 둡니다(기본 활성, 사용자가 끌 수 있음).
- 초기 포커스: 기본값은 `Cancel` 버튼입니다. 파괴적 작업에서 실수 Enter를 막기 위함입니다.
- 구조: `Root / Trigger / Overlay / Content / Title / Description / Cancel / Action` 8개 compound 파트로 제공합니다.
- 내부 구현: 현재 작업 중인 Dialog의 **Portal, Focus Trap, Scroll Lock**은 공용 내부 훅으로 추출해 재사용합니다. AlertDialog가 Dialog와 "닫힘 규칙과 role만 다른 쌍둥이"가 되도록 합니다.
- 스타일 중립: FrameUI 철학에 따라 스타일은 주입하지 않습니다. "파괴적 액션"은 `destructive?: boolean` prop으로 의미만 노출하고, `data-destructive` 속성을 통해 사용자 CSS가 구독할 수 있게 합니다.

즉, **Dialog는 "작업의 공간"을, AlertDialog는 "결정의 순간"을** 담당합니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

모바일 웹/하이브리드 앱 환경에서 확인 다이얼로그는 데스크톱과 다른 고려사항이 많습니다. FrameUI는 headless를 유지하면서도 "사용자가 모바일 관례대로 스타일링했을 때 제대로 동작하도록" 내부 동작을 다음과 같이 설계합니다.

### 3.1. 중앙 모달 vs 바텀시트: 마크업 독립성

모바일에서는 확인 다이얼로그를 **풀스크린** 또는 **바텀시트(bottom sheet)**로 표현하는 관례가 iOS/Android 양쪽에서 보편적입니다(iOS Action Sheet, Material Dialog). FrameUI는 기본 마크업은 중앙 모달을 가정하지만, 사용자가 `Content`를 `asChild`로 자신이 만든 바텀시트 컨테이너에 붙이거나 CSS로 화면 하단 고정 레이아웃을 짜더라도 **잠금 상태 관리(open/close, focus trap, scroll lock)는 DOM 배치와 독립적으로 동작**해야 합니다. 이를 위해 내부 로직은 Content의 위치/크기/포지셔닝 방식에 어떤 가정도 하지 않습니다.

### 3.2. Scroll Lock과 iOS Safari

iOS Safari는 `overflow: hidden`만으로는 body 스크롤이 완전히 막히지 않는 잘 알려진 이슈가 있습니다. Dialog 계열에서 공용으로 쓸 Scroll Lock 훅은 다음을 보장해야 합니다.

- 모달이 열릴 때 `document.body`를 `position: fixed`로 고정하되, 현재 `scrollY`를 top 오프셋으로 기록해 시각적 점프를 방지합니다.
- 닫힐 때 기록해 둔 `scrollY`로 `window.scrollTo`를 호출해 **스크롤 위치를 복원**합니다.
- 여러 Dialog/AlertDialog가 동시에 열릴 수 있으므로 내부에서 카운터(nesting count)를 유지하여, 가장 바깥 모달이 닫힐 때에만 lock을 해제합니다.

### 3.3. 하드웨어 뒤로가기(popstate) = dismiss

Android 하드웨어 백 버튼과 제스처 백은 `popstate` 이벤트로 관찰됩니다. 사용자 관점에서 "뒤로"는 당연히 "이 모달을 닫는다"로 해석되어야 네이티브 앱스러운 느낌을 줍니다. AlertDialog는 `onOpenChange(false)`를 `popstate`에 바인딩할 수 있는 훅을 제공하는 방향을 기본값으로 검토합니다. 단, 히스토리 스택을 함부로 추가하면 라우팅과 충돌할 수 있으므로, opt-in 형태(`dismissOnBackButton?: boolean`)로 열어 두고 기본은 off로 둡니다.

### 3.4. 터치 타겟과 버튼 배치

모바일에서 Cancel과 Action 버튼의 히트 영역은 최소 **48×48 dp** 이상이어야 합니다. 이는 라이브러리가 스타일을 강제하지 않으므로 문서(ADR 및 README 예시)로만 권고하며, 마크업 차원에서는 Cancel/Action이 각각 `<button>`이라 사용자가 패딩/높이를 자유롭게 조절할 수 있습니다. 또한 실사용 데이터에서 **세로 배치가 가로 배치보다 오클릭이 적다**는 점은 잘 알려져 있으므로, 데모 앱 예시는 기본적으로 세로 배치를 채택합니다.

### 3.5. 키보드가 뜨는 맥락과 `visualViewport`

텍스트 입력을 동반한 확인 다이얼로그(예: "삭제하려면 프로젝트 이름을 입력하세요")에서는 모바일 키보드가 올라오면서 뷰포트 높이가 절반 수준으로 줄어듭니다. 이때 Content가 절대 위치로 중앙 고정되어 있으면 키보드에 가려질 수 있습니다. Dialog 계열 공용 훅은 `window.visualViewport`의 `resize`/`scroll`을 관찰해, Content를 **실제 가시 영역의 중앙**에 맞추는 옵션을 노출합니다. 기본값은 중앙 정렬이 아닌 "CSS에 위임"이지만, 필요한 사용자는 `Dialog.usePositioner()`류 훅으로 구독할 수 있게 설계합니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

AlertDialog는 FrameUI에서 접근성을 가장 엄격하게 강제하는 컴포넌트 중 하나입니다.

- **`role="alertdialog"` 고정**: Content는 항상 `alertdialog` 역할을 가집니다. 이 점은 `asChild`를 써서 커스텀 컨테이너로 바꿔도 병합됩니다.
- **`aria-modal="true"`**: 모달 맥락을 보조 기술에 명시합니다.
- **자동 ID 연결**:
  - `Title`이 마운트되면 자동 생성 ID를 Content의 `aria-labelledby`에 연결합니다.
  - `Description`이 마운트되면 자동 생성 ID를 Content의 `aria-describedby`에 연결합니다.
  - 스크린리더는 모달이 열리는 순간 제목과 설명을 **모두** 읽어야 사용자가 상황을 정확히 파악할 수 있으므로, 두 ID가 모두 걸렸는지는 컴포넌트 책임입니다.
- **파괴적 의미 노출**: `destructive?: boolean` prop을 Root 혹은 Action에 둘지 논의했고, 시맨틱이 Action에 귀속된다는 점을 고려해 **Action 기준 `data-destructive` 속성**으로 최종 통일합니다. `aria-describedby`의 본문에서 결과를 명시(예: "이 작업은 되돌릴 수 없습니다")하도록 사용 가이드에 적습니다.
- **초기 포커스 전략**:
  - `destructive`가 true일 때: `Cancel`에 초기 포커스(실수 Enter 방지).
  - `destructive`가 false일 때(비파괴 확인, 예: "파일을 저장하시겠습니까?"): `Action`에 초기 포커스 허용. 다만 내부 기본값은 일관성을 위해 Cancel로 두고, `initialFocus` prop으로 사용자가 오버라이드합니다.
- **Focus Trap**: 모달이 열려 있는 동안 Tab 키는 Content 내부에서만 순환합니다. Shift+Tab은 역순. 마지막 요소에서 Tab은 첫 요소로, 첫 요소에서 Shift+Tab은 마지막 요소로 돌아갑니다. 모달이 닫히면 Trigger로 포커스를 복구합니다.
- **Esc 옵션화**: 기본값은 Esc로 닫힘이지만, "반드시 Cancel/Action 중 하나를 눌러야만 하는" 비즈니스 맥락을 위해 `disableEscapeClose?: boolean`을 노출합니다. Overlay 클릭 닫힘은 기본적으로 off이며, 여는 옵션은 **제공하지 않습니다**(이 부분이 일반 Dialog와의 결정적 분기점).

## 5. API 설계 (API Design)

모든 import는 다음 형태로 통일합니다.

```tsx
import { AlertDialog } from "frame-ui";
```

### 5.1. `AlertDialog` (Root) Props

| Prop                  | 타입                        | 기본값 | 설명                                                                 |
| --------------------- | --------------------------- | ------ | -------------------------------------------------------------------- |
| `open`                | `boolean`                   | —      | 제어 모드에서의 열림 상태.                                           |
| `defaultOpen`         | `boolean`                   | `false`| 비제어 모드 초기 상태.                                               |
| `onOpenChange`        | `(open: boolean) => void`   | —      | 열림 상태가 바뀔 때 호출.                                            |
| `destructive`         | `boolean`                   | `false`| Action이 파괴적 의미임을 선언. Action에 `data-destructive`가 붙음.   |
| `disableEscapeClose`  | `boolean`                   | `false`| true면 Esc로 닫히지 않음.                                            |
| `initialFocus`        | `"cancel" \| "action"`      | `"cancel"` | 초기 포커스 대상.                                                |
| `children`            | `ReactNode`                 | —      | Trigger/Overlay/Content 등 compound 자식.                            |

Prop 기반 "1단계 모드"를 위해 `title`, `description`, `cancelLabel`, `actionLabel`, `trigger`도 Root에서 받을 수 있게 확장합니다(ADR 0001의 4.2 패턴과 동일한 점진적 API).

### 5.2. Compound 파트

- `AlertDialog.Trigger`: Trigger를 여는 버튼. `asChild` 지원.
- `AlertDialog.Overlay`: 배경. 클릭으로 닫히지 **않음**(일반 Dialog와의 차이).
- `AlertDialog.Content`: `role="alertdialog"` 고정, `aria-modal="true"`, `aria-labelledby`/`aria-describedby` 자동 연결.
- `AlertDialog.Title`: 제목. 자동 id 부여.
- `AlertDialog.Description`: 설명. 자동 id 부여.
- `AlertDialog.Cancel`: 취소 의도 버튼. 클릭 시 `onOpenChange(false)` 기본 호출. 사용자 `onClick`으로 추가 처리 가능.
- `AlertDialog.Action`: 확정 의도 버튼. 클릭 시 기본으로 닫히며, `destructive=true`일 때 `data-destructive` 속성 노출.

### 5.3. Cancel/Action 의미 분리와 headless 원칙

`onConfirm`, `onCancel`이라는 Root 수준 콜백을 의도적으로 **두지 않습니다**. FrameUI는 headless 레이어이므로, 각 버튼의 의미론적 동작은 사용자가 해당 버튼의 `onClick`에서 직접 정의하도록 합니다. 이는 "비동기 confirm → 로딩 → 에러 재시도" 같은 실제 비즈니스 흐름에서 오히려 장애물을 줄이는 선택입니다. 라이브러리는 **버튼을 언제 닫을지**만 책임지고, **무엇을 수행할지**는 사용자 코드가 책임집니다.

## 6. 사용 예시 (Usage Examples)

### 6.1. 1단계: Prop 기반 간단 확인

```tsx
import { AlertDialog } from "frame-ui";

export default function DeleteAccountButton() {
  return (
    <AlertDialog
      destructive
      trigger={<button>계정 삭제</button>}
      title="계정을 삭제하시겠어요?"
      description="이 작업은 되돌릴 수 없습니다. 모든 프로젝트와 기록이 영구적으로 제거됩니다."
      cancelLabel="취소"
      actionLabel="삭제"
      onOpenChange={(open) => {
        if (!open) console.log("closed");
      }}
    />
  );
}
```

### 6.2. 2단계: Compound + destructive 커스텀 스타일

```tsx
import { AlertDialog } from "frame-ui";

export default function DeleteProjectDialog({ projectName }: { projectName: string }) {
  const handleDelete = async () => {
    await fetch(`/api/projects/${projectName}`, { method: "DELETE" });
  };

  return (
    <AlertDialog destructive>
      <AlertDialog.Trigger asChild>
        <MyDangerButton>프로젝트 삭제</MyDangerButton>
      </AlertDialog.Trigger>

      <AlertDialog.Overlay className="my-overlay" />
      <AlertDialog.Content className="my-sheet">
        <AlertDialog.Title className="text-lg font-bold">
          "{projectName}" 프로젝트를 삭제할까요?
        </AlertDialog.Title>
        <AlertDialog.Description>
          모든 파일과 공동 작업자 접근 권한이 함께 제거됩니다.
        </AlertDialog.Description>

        <div className="stack">
          <AlertDialog.Cancel className="btn-ghost">취소</AlertDialog.Cancel>
          <AlertDialog.Action
            className="btn-danger"
            onClick={handleDelete}
          >
            영구 삭제
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
```

`data-destructive` 속성이 `Action`에 붙어 있으므로, 사용자 CSS에서 다음처럼 직접 스타일을 걸 수 있습니다.

```css
[data-ui="alert-dialog-action"][data-destructive] {
  background: var(--danger, #dc2626);
  color: white;
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

### 7.1. Dialog에 `mode="alert"` 옵션 추가

하나의 `Dialog` 컴포넌트에 `mode?: "dialog" | "alert"`를 두어 같은 API로 두 케이스를 처리하는 안.

- 장점: 컴포넌트 개수가 늘지 않음, 내부 구현 재사용이 자연스러움.
- 단점: 기본값 규칙(닫힘/포커스/role)이 mode에 따라 뒤집혀 **"같은 컴포넌트인데 동작이 정반대"**가 되는 API 혼동. 자동완성에서 관련 없는 prop이 섞임. 시맨틱이 prop에 숨어 있어 리뷰어가 놓치기 쉬움.
- 결론: 기각.

### 7.2. 별도 컴포넌트 분리 (채택)

`AlertDialog`를 최상위 컴포넌트로 둔다.

- 장점: 의도가 타입 시스템과 import 라인에서 즉시 드러남, 기본값을 분기 없이 고정할 수 있음, 공용 훅으로 내부 재사용도 가능.
- 단점: 내부 코드 중복 가능성. 이는 Portal/Focus trap/Scroll lock을 공용 훅(`useDismissableLayer`, `useFocusTrap`, `useScrollLock`)으로 추출해 해결.
- 결론: 채택.

### 7.3. 사용자에게 role 설정을 맡기기

`Dialog`만 두고 `role="alertdialog"`는 사용자가 Content의 props로 직접 넘기도록 하는 안.

- 장점: 라이브러리가 가장 얇아짐.
- 단점: 접근성이 "사용자 성실함"에 의존. FrameUI의 "접근성 기본 제공" 원칙에 정면으로 반함. 닫힘/포커스 규칙은 여전히 일반 Dialog 기본값이라 role만 바꿔도 UX는 위험함.
- 결론: 기각.

## 8. 결과 (Consequences)

### Positive

- 파괴적 액션 확인 플로우가 **짧은 코드와 안전한 기본값**으로 동시에 해결됨.
- `role="alertdialog"`, Title·Description 자동 연결, 초기 포커스 Cancel이 기본값으로 보장되어, 평균적인 팀이 만드는 확인 다이얼로그의 접근성 최저선이 올라감.
- 일반 Dialog는 "작업 공간" 의미에만 집중할 수 있어 내부 분기 복잡도가 증가하지 않음.
- 모바일에서 바텀시트로 꾸미거나 키보드와 상호작용하는 경우에도, Scroll lock·Focus trap·뷰포트 관찰이 DOM 배치에 독립적으로 동작함.

### Negative

- Dialog와 AlertDialog 사이의 코드 중복 위험이 존재함. 이를 막기 위해 **공용 내부 훅**(`useDismissableLayer`, `useFocusTrap`, `useScrollLock`, `usePortal`)을 Dialog 선행 작업에서 함께 추출할 책임이 있음.
- 1단계 Prop 기반 API(`title`, `description`, `cancelLabel`, `actionLabel`)와 Compound API가 동시에 존재하므로, 내부적으로 "어느 모드인지"를 감지하는 Prop Sniffing 로직이 Dialog와 유사한 형태로 다시 필요함.
- `destructive`가 순수하게 의미 플래그이므로, 사용자 쪽 CSS 컨벤션(`[data-destructive]`)을 팀 내에서 합의해야 시각적 일관성이 확보됨. 이는 문서로 가이드.

### Ongoing

- Dialog 선행 작업이 끝나면, Portal/Focus trap/Scroll lock을 `src/hooks/`로 이동하고 Dialog와 AlertDialog 양쪽이 import해 재사용하도록 리팩토링한다.
- `visualViewport` 기반 포지셔닝 훅(`useVisualViewportCenter` 가칭)은 선택 API로 제공하되, 기본 마크업에는 묶지 않는다(headless 원칙).
- `dismissOnBackButton` 옵션과 `popstate` 연동은 라우팅 라이브러리(React Router, TanStack Router 등)와의 상호작용을 별도 ADR에서 다루고, AlertDialog 본체에는 훅 수준의 opt-in만 노출한다.
- 향후 Toast, Popover 등 다른 Layered 컴포넌트를 도입할 때, 여기서 추출될 공용 훅이 공통 기반이 되도록 네이밍과 인터페이스를 일반화한다.
