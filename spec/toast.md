# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: Toast
- 한 줄 설명: Provider 기반 스택과 명령형 API로 일시 알림을 안전하게 관리하며, Prop / Compound / asChild 세 가지 점진적 확장 경로를 제공하는 비차단(non-blocking) 알림 컴포넌트

## 2. 해결할 문제

- 기존 `Popup`은 단일 인스턴스 전용이라 동시 다수 알림(저장됨/네트워크 오류 등)을 표현할 수 없고, 명령형 호출(`toast.success(...)`) 진입점이 없어 이벤트 핸들러 안에서 JSX 없이 알림을 띄울 수 없다.
- 스크린리더에 적절한 ARIA 역할을 선택하기 어렵고(`role="status"` vs `role="alertdialog"`), 잘못 쓰면 작업 흐름을 가로채거나 알림이 전혀 전달되지 않는다.
- 자동 닫힘 타이머가 hover/focus, 탭 비활성(`document.hidden`), 창 blur 상태에서도 흘러서, 사용자가 다 읽기 전에 사라지거나 돌아왔을 때 이미 사라진 알림을 마주한다.
- 동일 이벤트(예: 네트워크 재시도)가 반복되면 같은 토스트가 수십 개 누적되어 화면이 가려진다(stack explosion).
- 가장 흔한 단순 케이스(`title` + 자동 닫힘)는 한 줄로 끝나야 하지만, 복잡한 케이스(커스텀 레이아웃, 액션 버튼, 사용자 디자인 시스템의 버튼 컴포넌트 재사용)에서는 내부 마크업을 완전히 분해·교체할 수 있어야 한다.

## 3. 필요한 필수 기능

1. **Provider + Viewport + Root 구조**: `Toast.Provider`가 스택과 타이머를 전역 관리하고, `Toast.Viewport`가 렌더 컨테이너(`<ol>`)를 제공하며, `Toast.Root`가 개별 토스트의 컨테이너 역할을 한다. 하위 요소로 `Toast.Title`, `Toast.Description`, `Toast.Action`, `Toast.Close`가 있다.

2. **단일 컴포넌트의 점진적 확장 (Prop 모드 ↔ Compound 모드)**:
   - **Prop 모드 (기본)**: `<Toast.Root title="..." description="..." action={...} />`처럼 props만으로 보일러플레이트 없이 사용한다. 내부에서 자동으로 `<Toast.Title>` / `<Toast.Description>` / 사용자 action / 자동 `<Toast.Close>` 마크업을 조립한다.
   - **Compound 모드**: 복잡한 레이아웃이나 추가 요소가 필요하면 props 없이 children에 `<Toast.Title>` 등을 직접 조립한다.
   - 같은 `Toast.Root` 컴포넌트가 props 유무를 감지(Prop Sniffing)해 두 모드를 자동 분기한다. 두 모드를 혼용하면 dev 경고를 띄우고 Prop 모드를 우선 적용한다.
   - Prop 모드에서 자동 부착되는 Close 버튼은 `hideClose` prop으로 끌 수 있다.

3. **`asChild` (Slot) 패턴으로 마크업 교체**: `Toast.Root` / `Toast.Action` / `Toast.Close`에 `asChild` prop을 주면 FrameUI가 제공하는 기본 엘리먼트(`<li>`, `<button>`) 대신 사용자가 넘긴 단일 자식 엘리먼트(예: `<a>`, `<MyButton />`, `<section>`)에 `data-ui` / `role` / `aria-*` / 이벤트 핸들러를 머지한다. 이때 (a) 이벤트 핸들러는 자식 → slot 순서로 체이닝되며 자식이 `e.preventDefault()`를 호출하면 slot 핸들러를 건너뛰고, (b) `className`은 공백 concat, `style`은 객체 머지(자식이 충돌 시 승리), (c) 그 외 props는 자식이 정의되어 있으면 자식이 승리해 명시적 override를 허용한다.

4. **두 가지 진입점**: 선언형 `<Toast.Root open={...}>` (Controlled / `defaultOpen` Uncontrolled)과 명령형 `useToast()` 훅의 `toast()`, `toast.success()`, `toast.error()`, `toast.dismiss(id)`, `toast.update(id, opts)`를 동등하게 지원한다.

5. **`type` prop으로 ARIA 역할 자동 결정**: `type="background"`(기본)은 `role="status"` + `aria-live="polite"`, `type="foreground"`는 `role="alertdialog"` + `aria-live="assertive"`를 적용한다. 사용자가 `aria-live`를 수동으로 기억하지 않아도 된다.

6. **자동 닫힘과 일시정지**: `duration`(기본 5000ms, `Infinity` 허용) 경과 시 자동 dismiss하되, Viewport `:hover` / 내부 `:focus-visible` / `document.visibilityState === "hidden"` / `window.blur` 상태에서는 모든 타이머를 일시정지하고 복귀 시 남은 시간부터 재개한다.

7. **스택 제한과 중복 합치기**: `limit`(기본 3)을 초과하는 토스트는 큐에 대기시켰다가 앞 항목이 dismiss되면 자리를 양보한다. 동일 `id`로 다시 호출되면 새 노드를 추가하지 않고 기존 노드를 업데이트하고 duration을 리셋한다(duplicate collapse).

8. **`data-*` 계약을 통한 unstyled 스타일링**: `data-ui="toast-*"`, `data-state="open" | "closed"`, `data-type`, `data-priority`를 노출해 사용자가 CSS로 진입/퇴장 애니메이션과 테마를 직접 연결할 수 있어야 한다. 이 계약은 Prop / Compound / asChild 모든 경로에서 동일하게 적용된다.