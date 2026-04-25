# ADR 0009: Accordion 컴포넌트 (Accordion Component)

## 1. 배경 및 문제 (Context & Problem)

Accordion은 정보 구조를 압축하고, 사용자가 필요할 때만 상세 내용을 확장하도록 돕는 중요한 UI 패턴입니다. 그러나 실제로 직접 구현할 때 다음과 같은 문제가 자주 발생합니다.

- **접근성 없는 헤더 토글**
  - Accordion 헤더를 단순한 `<div>`나 `button` 없는 요소로 구현하는 경우가 많습니다. 이로 인해 키보드 사용자가 접근하거나 스크린리더가 적절히 읽을 수 없습니다.
  - `aria-expanded`, `aria-controls`, `id`를 일관되게 부여하지 않아서 열림/닫힘 상태가 비의미하게 됩니다.
- **키보드 네비게이션 누락**
  - Accordion 헤더 간 이동은 ArrowUp/ArrowDown, Home/End 키로 할 수 있어야 합니다. 이 기능이 빠지면 키보드 사용자가 반복 tab으로 모든 헤더를 찾아야 합니다.
  - Enter/Space로 토글할 수 있지만, focus 관리를 잘못하면 키 누름이 실행되지 않거나 포커스가 Content 영역으로 이동합니다.
- **Single vs Multiple 모드 혼동**
  - 여러 항목을 동시에 열 수 있는 `multiple` 모드와 한 항목만 열리는 `single` 모드를 혼합하여 설계하면 사용성이 깨집니다. 특히 single 모드에서 "항목을 다시 닫을 수 있는지"(`collapsible`) 여부를 명확히 분리해야 합니다.
- **애니메이션/레이아웃 전환 문제**
  - Content 높이를 토글할 때 CSS transition을 잘못 적용하면 레이아웃 점프나 콘텐츠 잘림이 생깁니다. `max-height` 트릭, JS 높이 측정, `overflow` 관리를 일관되게 하지 않으면 퍼포먼스가 나빠집니다.
- **헤더와 패널의 역할 혼동**
  - Accordion은 Tabs와 비슷해 보이지만, 헤더는 실제로 `button`이고 패널은 `region`입니다. Tabs처럼 `role="tablist"` / `role="tab"`를 부여하면 잘못된 ARIA 패턴이 됩니다.
- **아이템 재사용성 vs Root 의존성 트레이드오프**
  - 각 Item을 독립적으로 렌더할 수 있게 하려다가, Root가 관리해야 할 상태(`open keys`, `type`)가 분산되는 경우가 많습니다. 결과적으로 상태가 두 군데에서 유지되어 버그가 생깁니다.

FrameUI는 이러한 문제들을 "헤드리스 로직과 접근성 계약을 컴포넌트 레벨에서 단일화"하여 반복 구현 비용을 줄이고, 디자인 시스템에 맞는 일관된 Accordion API를 제공해야 합니다.

## 2. 결정 (Decision)

FrameUI는 Accordion을 다음과 같은 원칙으로 설계합니다.

1. **Root가 `open` 상태를 소유한다.**
   - `Accordion.Root`가 현재 열린 항목의 키 목록(`value`/`defaultValue`)을 관리합니다.
   - `Accordion.Item`은 `value`(또는 `id`) 만큼 개별 항목을 고유하게 식별하며, Root의 상태에 따라 열림/닫힘을 결정합니다.
2. **`single` / `multiple` 모드를 명확히 분리한다.**
   - `type="single" | "multiple"`를 제공하고, `single`에서 `collapsible` 옵션을 통해 "열려있는 항목을 닫을 수 있는지"를 제어합니다.
   - `single` 모드 기본값은 `collapsible=false`로 하되, `collapsible=true`를 명시하면 열림 상태를 다시 닫을 수 있게 합니다.
3. **헤더는 `button`, 패널은 `region`이다.**
   - `Accordion.Trigger`는 `button` 역할을 수행하며, `aria-expanded`, `aria-controls`, `id`를 자동 부여합니다.
   - `Accordion.Content`는 `region` 역할을 갖고 `aria-labelledby`로 헤더와 연결됩니다.
4. **Keyboard navigation을 Root 수준에서 관리한다.**
   - ArrowUp/ArrowDown/Home/End를 `Accordion.Trigger` 사이에서 순환하도록 구현합니다.
   - Focus 이동은 헤더 간에만 이루어지며, Content 영역으로 자동 포커스되지 않습니다.
5. **`asChild` 패턴을 지원한다.**
   - 사용자가 스타일링 프레임워크나 커스텀 버튼 컴포넌트를 쓰기 위해 `Accordion.Trigger`에 `asChild`를 지원합니다.
6. **CSS 데이터 속성 규약을 따른다.**
   - `data-ui="accordion"`, `data-state="open|closed"`, `data-disabled`, `data-value` 등으로 일관된 스타일링 지점을 제공합니다.
7. **Height 트랜지션은 구현에 맡기지 않는다.**
   - FrameUI는 기본적으로 `Accordion.Content`에 `hidden`과 `display: none` 대신 `aria-hidden`을 사용하며, 애니메이션을 원하는 경우 사용자 CSS/animation hook으로 처리할 수 있도록 `data-state`를 노출합니다.
   - 그러나 기본 `Accordion.Content`는 `overflow: hidden`과 `max-height` 전환(또는 CSS 변수) 패턴으로 애니메이션을 지원하는 유연한 API를 갖습니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

Accordion은 모바일에서 정보 계층을 정리할 때 자주 쓰이므로, 다음 원칙을 ADR 수준에서 합의합니다.

### 3.1. 터치 타깃

- 헤더 버튼은 최소 44×44 CSS px 터치 타겟을 확보해야 합니다.
- 텍스트가 길 경우 전체 헤더 영역을 클릭/터치할 수 있도록 `button` 내부 패딩을 충분히 둡니다.

### 3.2. 스크롤과 확장 간 충돌

- 모바일에서 Content 확장은 뷰포트를 크게 변경하므로, 열림/닫힘 시 `scroll-margin-top` 또는 `scrollIntoView` 같은 자동 스크롤은 사용자 구현 영역으로 둡니다.
- FrameUI는 `Accordion.Trigger`가 열릴 때 `onChange` 콜백만 제공하며, 자동 스크롤/포커스 이동은 애플리케이션 요구에 따라 추가 구현하도록 합니다.

### 3.3. 정보 숨김의 최소화

- 모바일에서 Accordion은 "한 번에 많은 정보를 한정된 공간에 담는 것"이므로, 주요 정보는 헤더에 요약 형태로 담고, 상세 정보는 Content에 둡니다.
- 헤더에 요약 텍스트, 상태 아이콘, 중요 지표를 함께 배치하면 사용자가 열지 않고도 핵심을 파악할 수 있습니다.

### 3.4. 단일 모드 vs 다중 모드 선택 기준

- **single 모드**는 FAQ, 설정 패널처럼 동시에 하나만 열리는 것이 명확한 경우에 적합합니다.
- **multiple 모드**는 "여러 항목을 동시에 비교해야 하는" 상세 비교, 필터 패널, 콘텐츠 그룹에서 적합합니다.
- 모바일에서는 `multiple` 모드로 두면 사용자가 여러 항목을 열어두고 비교할 수 있어 유리한 경우가 많으나, 복잡도가 커질 수 있습니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

### 4.1. ARIA 패턴

- `Accordion.Trigger`는 `button`이며, 항상 `aria-expanded` 속성을 가집니다.
- `Accordion.Content`는 `role="region"` 또는 `aria-hidden="true"`를 사용하며, `aria-labelledby`로 열린 헤더와 연결됩니다.
- `Accordion.Trigger`와 `Accordion.Content`는 고유한 `id`/`aria-controls` 쌍으로 연동됩니다.

### 4.2. Keyboard 인터랙션

- `Space`와 `Enter`는 현재 헤더를 토글합니다.
- `ArrowDown` / `ArrowUp`은 헤더 간 포커스를 이동합니다.
- `Home` / `End`는 첫/마지막 헤더로 이동합니다.
- `Tab`은 현재 Focus 위치에서 다음 포커스 가능한 요소로 이동하며, Accordion 외부로 자연스럽게 빠져나갑니다.

### 4.3. Single mode와 명확한 닫힘 규칙

- `type="single"`에서 `collapsible=false`인 경우, 사용자는 이미 열린 항목을 클릭해도 닫힐 수 없습니다. 이는 단일 선택 상태를 FAQ처럼 유지하기 위함입니다.
- `collapsible=true`인 경우, 현재 열린 항목을 닫을 수 있습니다.
- `type="multiple"`에서는 각 항목이 독립적으로 열리고 닫힐 수 있습니다.

### 4.4. `asChild`와 포커스

- `asChild`를 사용할 때도 `button` 역할과 키보드 이벤트가 보존되어야 합니다.
- 커스텀 컴포넌트가 `tabIndex`를 가진 경우, Accordion은 이를 덮어써서 헤더 포커스 순서가 깨지지 않도록 합니다.

### 4.5. `disabled` 상태

- `Accordion.Item`에 `disabled`를 주면 `Trigger`는 `aria-disabled="true"`, `disabled` 속성을 부여하고 클릭/키 입력을 차단합니다.
- disabled 항목은 포커스 순서에서 제외하지 않지만, `Tab`으로 이동할 수 있어야 하며, `Space`/`Enter`가 아무 작업도 수행하지 않습니다.

## 5. API 설계 (API Design)

### 5.1. Root Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `"single" | "multiple"` | `"single"` | 하나만 열릴지 여러 개가 열릴지 결정. |
| `collapsible` | `boolean` | `false` | `type="single"`일 때 열린 항목을 닫을 수 있는지. |
| `value` | `string | string[]` | — | 제어 모드 선택 키. `type="multiple"`이면 문자열 배열. |
| `defaultValue` | `string | string[]` | `type === "multiple" ? [] : ""` | 비제어 모드 초기 선택. |
| `onValueChange` | `(value: string | string[]) => void` | — | 열림 상태 변경 콜백. |
| `disabled` | `boolean` | `false` | 전체 Accordion 비활성화. |
| `collapsible` | `boolean` | `false` | Single mode에서 현재 열린 Item을 다시 닫을 수 있는지. |
| `loop` | `boolean` | `true` | Arrow 키 네비게이션 시 끝에서 다시 맨 앞으로 순환할지. |

### 5.2. Compound 구조

```tsx
Accordion.Root
├── Accordion.Item(value="item-1")
│   ├── Accordion.Header
│   │   └── Accordion.Trigger
│   └── Accordion.Content
├── Accordion.Item(value="item-2")
│   ├── Accordion.Header
│   │   └── Accordion.Trigger
│   └── Accordion.Content
└── Accordion.Item(value="item-3")
    ├── Accordion.Header
    │   └── Accordion.Trigger
    └── Accordion.Content
```

### 5.3. Context 값

```ts
interface AccordionContextValue {
  type: "single" | "multiple";
  value: string | string[];
  openKeys: string[];
  onToggle: (value: string) => void;
  disabled: boolean;
  loop: boolean;
}
```

- `Accordion.Item`은 `value`를 key로 삼아, `openKeys`에 포함 여부로 열림 상태를 결정합니다.
- `Accordion.Trigger`는 `onToggle(value)`를 호출하여 Root에 상태 변경을 위임합니다.

### 5.4. 데이터 속성

- `Accordion.Root`: `data-ui="accordion"`, `data-type="single|multiple"`, `data-disabled`
- `Accordion.Item`: `data-ui="accordion-item"`, `data-state="open|closed"`, `data-value="..."`
- `Accordion.Trigger`: `data-ui="accordion-trigger"`, `data-state="open|closed"`, `data-disabled`
- `Accordion.Content`: `data-ui="accordion-content"`, `data-state="open|closed"`, `aria-hidden="true|false"`

### 5.5. `asChild` 지원

- `Accordion.Trigger`는 `asChild` 패턴을 지원하여, 사용자가 커스텀 버튼 또는 다른 컴포넌트를 삽입할 수 있습니다.
- 이때 `aria-expanded`, `aria-controls`, `id`, `disabled`, `onClick` 등 필수 속성을 child에 병합합니다.

## 6. 사용 예시 (Usage Examples)

### 6.1. FAQ 용 기본 Accordion

```tsx
import { Accordion } from "frame-ui";

export default function FAQ() {
  return (
    <Accordion.Root type="single" defaultValue="item-1">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>배송 기간은 얼마나 걸리나요?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          일반적으로 2~3일 이내에 발송됩니다. 다만, 공휴일 및 지역에 따라 차이가 있을 수 있습니다.
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>교환/환불 정책은 어떻게 되나요?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          수령 후 7일 이내 미개봉 상품에 한해 교환/환불이 가능합니다.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
```

### 6.2. 여러 항목 동시 확장 가능 (multiple 모드)

```tsx
<Accordion.Root type="multiple" defaultValue={["item-1", "item-3"]}>
  <Accordion.Item value="item-1">...</Accordion.Item>
  <Accordion.Item value="item-2">...</Accordion.Item>
  <Accordion.Item value="item-3">...</Accordion.Item>
</Accordion.Root>
```

### 6.3. 커스텀 Trigger와 Chevron 아이콘

```tsx
<Accordion.Item value="item-1">
  <Accordion.Header>
    <Accordion.Trigger asChild>
      <button className="accordion-button">
        <span>요약 정보</span>
        <ChevronIcon aria-hidden="true" />
      </button>
    </Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content>...</Accordion.Content>
</Accordion.Item>
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

- **네이티브 `<details>` / `<summary>` 사용**
  - 장점: 브라우저가 기본적으로 접근성과 토글 동작을 처리합니다.
  - 단점: 스타일 제어가 제한적이고, `multiple` 모드나 `single` 모드의 `collapsible` 제어를 통일된 API로 제공하기 어렵습니다. `asChild` 같은 복합 컴포넌트 구조를 지원하기도 어렵습니다.
- **Tabs 기반 구현**
  - 장점: 이미 존재하는 키보드 네비게이션 패턴을 재사용할 수 있습니다.
  - 단점: Accordion은 탭과 목적이 다릅니다. `role="tablist"`/`role="tab"`은 의미적으로 잘못되어 접근성 규약을 위반합니다. 또한 Tabs는 동시에 여러 패널이 열리는 구조를 지원하지 않습니다.
- **각 Item을 독립 상태로 구현**
  - 장점: 단순한 구조.
  - 단점: 상태가 각 Item에 분산되어 `single`/`multiple` 모드를 일관되게 처리하기 어렵고, Header 간 네비게이션을 중앙에서 관리할 수 없습니다.

## 8. 결과 (Consequences)

### 긍정적

- Accordion 상태 관리와 접근성 ARIA 계약이 Root 단일 지점에 집중되어, 구현 오류가 줄어듭니다.
- `type="single"`과 `type="multiple"`을 명확히 분리하여 FAQ vs 상세 비교용 Accordion의 목적을 구분할 수 있습니다.
- `asChild` 지원으로 디자인 시스템 위에 다양한 버튼/아이콘 컴포넌트를 쉽게 얹을 수 있습니다.
- 데이터 속성(`data-state`, `data-ui`) 덕분에 CSS 스타일링과 상태 기반 변형이 일관됩니다.

### 부정적

- Root 외부에서 `Accordion.Item`을 재사용하거나 동적으로 분리하는 경우, Root와 Item 사이의 강한 의존성이 필요합니다. 이는 `Pagination`, `Tabs`와 유사한 트레이드오프입니다.
- 사용자에게 자동 스크롤/레이아웃 전환을 전적으로 맡기므로, "열리면서 뷰로 스크롤됨"과 같은 UX는 애플리케이션 수준에서 별도 구현이 필요합니다.
- `Accordion.Content` 높이 애니메이션을 완전히 캡슐화하지 않기 때문에, 복잡한 트랜지션을 원하면 사용자 스타일이 추가로 필요합니다.

---

위 결정은 FrameUI가 Accordion을 "접근성, 키보드 네비게이션, 상태형 모드" 측면에서 명확하게 정의하고, 디자인 시스템 내 다른 Compound 컴포넌트와 일관된 API를 제공하는 방향으로 정리한 것입니다.
