# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: Tabs
- 한 줄 설명: 연관된 콘텐츠를 그룹화하고 탭 버튼을 통해 여러 패널을 전환할 수 있는 접근성 기반 UI 컴포넌트

## 2. 해결할 문제

- 접근성: 스크린 리더 및 키보드 사용자가 명확하게 탭을 탐색하고 역할을 인지해야 합니다. Roving tabindex와 방향키를 이용한 탭 이동(WAI-ARIA Tabs Pattern)을 지원해야 합니다.
- 유연성: `Root`, `List`, `Trigger`, `Content` 등 요소들을 분리하는 Compound Component 패턴을 활용해, 탭 버튼과 패널 사이에 임의의 요소를 넣거나 다양한 구조(상단 탭, 하단 탭, 사이드 탭 등)로 쉽게 꾸밀 수 있어야 합니다.
- 상태 제어: `value` 제어 모드(Controlled)와 `defaultValue` 기반 모드(Uncontrolled)를 모두 매끄럽게 지원해야 합니다.

## 3. 구조 및 API 명세표 (Compound Components)

### `Tabs.Root`
- Tabs의 전체 컨텍스트와 상태(현재 활성화된 탭)를 관리합니다.
- `value` (string, optional): 현재 선택된 탭 값 (Controlled)
- `defaultValue` (string, optional): 초기 선택 탭 값 (Uncontrolled)
- `onValueChange` (function, optional): 탭이 바뀔 때 호출
- `orientation` ("horizontal" | "vertical", 기본: "horizontal"): 방향성, 화살표 네비게이션 방식에 영향을 줌
- `activationMode` ("automatic" | "manual", 기본: "manual"): 키보드 포커스 이동 시 자동 전환 여부 (선택적 기능)

### `Tabs.List`
- `Trigger` 버튼들을 래핑하고, 키보드 네비게이션(상하좌우 화살표, Home, End 키) 이벤트를 종합 관리합니다.
- 이 요소에는 `role="tablist"`와 `aria-orientation`이 자동 적용됩니다.

### `Tabs.Trigger`
- 클릭하거나 활성화하면 특정 `Content`를 보여주는 탭 버튼입니다.
- `value` (string, 필수): 연결될 탭 아이디/값
- `disabled` (boolean, optional): 해당 탭 클릭 및 포커스 차단 여부
- 해당 요소는 `role="tab"`, `aria-selected` 등 접근성 속성이 자동으로 설정됩니다.

### `Tabs.Content`
- 활성화된 탭에 대응해 화면에 렌더링될 내부 콘텐츠입니다.
- `value` (string, 필수): 자신을 표시하게 만들 Trigger의 value에 매칭되는 값
- 활성화되지 않았을 때는 DOM에 렌더링하지 않거나 숨기는 방식을 사용합니다 (`role="tabpanel"` 자동 적용).

## 4. 핵심 동작 명세
1. 키보드 동작 (Roving Tabindex):
   - 현재 활성화된 탭만 `tabindex="0"` 이고 나머지는 `-1`로 처리되어 하나의 Tab 트리거에만 포커스가 멈춥니다.
   - 포커스 상태에서 방향키를 입력하면 다음 활성화 가능한 `Tabs.Trigger`로 포커스를 부자연스럽게 옮깁니다 (이때 `Tabs.List`가 이를 감지하여 처리).
2. Activation Mode:
   - "manual" (기본값): 화살표로 탭 이동 중에는 탭 포커스만 이동하고 선택은 바뀌지 않습니다. Enter/Space 입력 시 탭이 전환됩니다.
   - "automatic": 화살표로 탭을 이동하는 즉시 해당 탭이 활성화되며 콘텐츠가 전환됩니다 (사용자가 편의를 위해 선택적 적용).
