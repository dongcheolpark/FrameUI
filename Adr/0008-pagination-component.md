# ADR 0008: Pagination 컴포넌트 (Pagination Component)

## 1. 배경 및 문제 (Context & Problem)

페이지네이션은 "페이지 번호 몇 개 버튼으로 나열하면 되는 단순한 UI"처럼 보이지만, 실제로 직접 구현할 때 반복적으로 같은 버그가 발생하는 대표적인 컴포넌트입니다. FrameUI가 이를 기본 컴포넌트로 제공하지 않을 경우, 사용자는 다음과 같은 실수를 반복하게 됩니다.

- **Ellipsis(…) 계산 로직 누락 또는 오작동**
  - `totalPages`가 크고 현재 페이지가 중간쯤일 때 `1 … 4 5 6 … 20` 형태로 축약해야 하지만, 조건 분기를 잘못 짜서 번호가 빠지거나 중복되는 경우가 잦습니다.
  - 특히 "현재 페이지 주변에 몇 개를 보여줄지(sibling)"와 "양 끝에 몇 개를 고정으로 보여줄지(boundary)"를 동시에 다룰 때 로직이 꼬입니다.
- **Boundary 겹침 처리 누락**
  - `1 2 … 3 4 5` 처럼 boundary와 sibling이 맞닿거나 겹칠 때 Ellipsis가 불필요하게 들어가거나, 반대로 필요한 번호가 사라집니다.
  - "Ellipsis 자리에 페이지 1개만 들어갈 수 있으면 Ellipsis 대신 그 번호를 그대로 보여줘야 한다"는 규칙을 매번 새로 구현합니다.
- **1-based / 0-based 혼동**
  - URL 쿼리는 `page=1`부터 시작하는데 내부 배열 인덱스는 0부터 시작해, off-by-one 버그가 자주 발생합니다.
- **접근성 누락**
  - 현재 페이지에 `aria-current="page"`를 붙이지 않고 단순히 CSS 클래스만 다르게 두는 사례가 매우 많습니다.
  - `aria-selected`를 (탭 컴포넌트의 습관으로) 잘못 붙이는 경우도 흔합니다. 페이지네이션 아이템은 "리스트박스의 선택된 옵션"이 아니라 "현재 보고 있는 페이지"이므로 `aria-current`가 올바른 속성입니다.
  - Ellipsis(`…`)를 스크린리더가 "dot dot dot" 또는 "horizontal ellipsis"로 읽어 소음이 발생하는데, `aria-hidden="true"` 처리를 빠뜨리는 경우가 많습니다.
- **Prev/Next 경계 처리 누락**
  - 첫 페이지에서 Prev가, 마지막 페이지에서 Next가 눌러지면 아무 일도 안 일어나는 "조용한 실패" 상태로 남는 경우가 많습니다. `disabled` + `aria-disabled`를 일관되게 부여해야 합니다.
- **Prev/Next만 있는 모바일 레이아웃을 매번 별도로 구현**
  - 데스크탑용 풀 레이아웃과 모바일용 컴팩트 레이아웃을 두 벌 유지하게 되어 로직이 중복됩니다.

이 문제들은 전부 "표시(rendering)"가 아니라 "파생 상태(derived state) 계산"과 "ARIA 계약"의 영역이기 때문에 Headless UI 레이어에서 해결하는 것이 적절합니다.

## 2. 결정 (Decision)

FrameUI는 `Pagination` 컴포넌트를 다음 원칙으로 제공합니다.

1. **Root가 파생 상태를 계산한다.** `totalPages`, 현재 `page`, `siblingCount`, `boundaryCount`를 받아 화면에 렌더링할 엔트리 리스트(`{ type: "page", value } | { type: "ellipsis" }`)를 Root가 계산해 Context로 내려보냅니다.
2. **Item / Ellipsis는 "받은 값을 렌더"하는 역할만 한다.** 자체적으로 어떤 페이지가 표시될지 계산하지 않습니다. 재사용성보다는 일관성을 우선합니다(자세한 트레이드오프는 8절 참고).
3. **1-based를 기본값으로 삼는다.** 사용자가 URL 쿼리·서버 API와 맞추는 수고를 줄이기 위함입니다. `onPageChange`는 1-based page 번호만 전달합니다(이벤트 객체 X, 인덱스 X).
4. **Prev / Next / First / Last는 내부적으로 `disabled`를 파생한다.** 사용자는 그냥 가져다 쓰고, 경계에서 눌림 방지와 `aria-disabled`는 Root가 보장합니다.
5. **구조 (Compound):**

   ```
   Pagination (= Pagination.Root)
   ├── Pagination.Prev
   ├── Pagination.First
   ├── Pagination.List
   │   ├── Pagination.Item       // pages array를 map으로 돌며 렌더
   │   └── Pagination.Ellipsis
   ├── Pagination.Last
   └── Pagination.Next
   ```

6. **표준 `data-*` 속성 규약을 따른다.** 다른 FrameUI 컴포넌트와 동일하게 `data-ui`, `data-state`, `data-disabled`를 부여해 사용자의 CSS 셀렉터가 일관되도록 합니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

페이지네이션은 "작은 화면에서 가장 쉽게 망가지는 컴포넌트"이므로, FrameUI는 모바일에서의 올바른 사용 패턴을 ADR 수준에서 합의합니다. 단, **FrameUI는 뷰포트를 감지하지 않습니다.** 헤드리스 철학상 미디어 쿼리/매치미디어는 사용자의 영역입니다. 대신 컴포넌트가 제공하는 props만으로 모바일 UX를 만들 수 있도록 API를 설계합니다.

### 3.1. 작은 화면에서 번호가 한 줄을 넘기는 문제

- 데스크탑에서 `siblingCount=1`, `boundaryCount=1`이면 보통 `1 … 4 5 6 … 20` 형태로 7~9개 엔트리가 나오지만, 모바일(360px~)에서는 이 자체로 한 줄을 넘기기 쉽습니다.
- 정석 해법은 **사용자 코드에서 뷰포트에 따라 props만 바꾸는 것**입니다. 예를 들어 모바일에서는 `siblingCount={0}` 또는 `boundaryCount={0}`으로 줄이면 `1 … 5 … 20` 또는 `… 5 …`처럼 매우 간결해집니다.
- FrameUI는 뷰포트를 감지하지 않으므로 사용자 측에서 `useMediaQuery`(또는 Tailwind 반응형, CSS container query)로 props 값을 주입합니다.

### 3.2. 터치 타겟 최소 크기

- Prev / Next / First / Last 버튼은 **최소 44 × 44 CSS px**의 터치 타겟(Apple HIG 기준, WCAG 2.5.5)을 권장합니다.
- 번호 Item도 **시각적 크기는 작아도 좋지만 hit area는 44 × 44**가 되도록 `padding`으로 확보하는 것을 권장합니다. FrameUI가 스타일을 강제하지 않지만 ADR 차원에서 이 치수를 권고사항으로 명시합니다.

### 3.3. 무한 스크롤로 대체 판단 기준

모바일에서는 페이지네이션이 최선이 아닌 경우가 많습니다. 아래 상황이면 무한 스크롤(또는 "더 보기" 버튼)을 우선 고려합니다.

- **탐색형 피드** (타임라인, 검색 결과 무한 탐색): 무한 스크롤이 자연스럽습니다.
- **정확한 위치 북마크/공유가 불필요한 콘텐츠**: 페이지 번호가 URL에 실릴 필요가 없다면 페이지네이션의 주된 가치(공유·재방문 시 위치 복원)가 사라집니다.

반대로 아래 상황이면 페이지네이션을 유지합니다.

- **관리자·데이터 테이블** (정렬/필터 후 특정 행을 찾아야 함): 현재 위치 북마크와 점프 이동이 중요합니다.
- **검색 결과 중에서도 "10페이지 쯤에 봤던 걸 다시 찾아야 하는" 종류**: 무한 스크롤은 위치 복원이 약합니다.
- **푸터나 CTA가 콘텐츠 뒤에 와야 하는 페이지**: 무한 스크롤은 푸터에 도달할 수 없게 만듭니다.

### 3.4. Sticky 페이지네이션과 safe-area

모바일에서 페이지네이션을 하단 고정(sticky bottom)으로 배치하는 경우, 아이폰의 홈 인디케이터 영역에 가려지지 않도록 `padding-bottom: env(safe-area-inset-bottom)`을 사용자 스타일에서 적용할 것을 권장합니다. FrameUI는 이 padding을 강제하지 않지만, 사용 예시(6.2)에 주석으로 명시합니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

### 4.1. 랜드마크

- Root는 `<nav aria-label="Pagination">`으로 렌더됩니다. 스크린리더 사용자가 "페이지네이션으로 점프"할 수 있도록 navigation 랜드마크로 노출하는 것이 표준입니다.
- 페이지 내에 동일한 리스트용 페이지네이션이 여러 개면 `aria-label`을 `"Search results pagination"`처럼 구별 가능하게 오버라이드할 수 있게 둡니다(prop으로 덮어쓰기 가능).

### 4.2. `aria-current="page"` (※ `aria-selected` 아님)

- 현재 페이지에 해당하는 Item에는 반드시 `aria-current="page"`를 부여합니다. 이것이 ARIA 표준에서 "이게 지금 보고 있는 페이지다"를 나타내는 유일한 올바른 속성입니다.
- **혼동 주의**: `aria-selected`는 리스트박스(`role="listbox"`)나 탭(`role="tab"`) 안의 선택 항목에 쓰는 속성입니다. 페이지네이션 Item은 "탭"이 아니라 "링크/버튼"이므로 `aria-selected`는 **쓰지 않습니다**. 실무에서 Tabs 구현 습관으로 `aria-selected`를 붙이는 실수가 매우 흔하므로, FrameUI는 애초에 `aria-current`만 부여하고 `aria-selected`는 일절 건드리지 않습니다.

### 4.3. Ellipsis는 스크린리더에 노출하지 않는다

- Ellipsis 엔트리는 `aria-hidden="true"`로 처리하고, 시각 텍스트는 `…`(U+2026) 또는 `...`을 렌더합니다.
- 스크린리더가 "horizontal ellipsis"라고 읽으면 노이즈가 되고, 페이지 간 이동에 실질적인 도움을 주지 않기 때문입니다.

### 4.4. Prev / Next / First / Last 라벨

- 이 버튼들이 아이콘만으로 구성되는 경우(예: `‹`, `›`, `«`, `»`, chevron SVG) 반드시 `aria-label`을 부여합니다. FrameUI는 기본값으로 `"Previous page"` / `"Next page"` / `"First page"` / `"Last page"`를 부여하며, 사용자가 prop으로 오버라이드 가능합니다(i18n).
- 텍스트가 들어있으면(`<Pagination.Prev>이전</Pagination.Prev>`) 기본 `aria-label`은 생략되고 버튼 텍스트가 접근성 이름이 됩니다.

### 4.5. 경계에서의 disabled

- 첫 페이지에서 Prev/First, 마지막 페이지에서 Next/Last는 `disabled` 속성과 함께 `aria-disabled="true"`를 부여합니다. `totalPages <= 1`이면 Prev/Next/First/Last 전부 disabled 상태가 됩니다.
- 일부 디자인에서는 "disabled지만 시각적으로 보여는 주고 싶다"는 요구가 있으므로, FrameUI는 두 속성을 항상 동시에 부여하되 CSS는 사용자에게 맡깁니다.

### 4.6. 링크(`<a>`) vs 버튼(`<button>`): `asChild` 선택

- SPA에서 client-side navigation을 쓰면 `<button>`이 자연스럽지만, SSR·SEO가 중요한 사이트에서는 페이지 번호를 실제 `href`가 있는 `<a>`로 렌더해 크롤러에게 페이지 구조를 노출하는 것이 유리합니다.
- FrameUI는 `Pagination.Item` 기본 렌더를 `<button>`으로 두고, `asChild` 패턴(ADR 0001 참고)을 지원해 Next.js의 `<Link>` 또는 `<a href="?page=3">`로 바꿔 낄 수 있게 합니다. 이때 `aria-current`, `data-state`, 클릭 핸들러는 child에 머지됩니다.

## 5. API 설계 (API Design)

### 5.1. Root Props

| Prop            | Type                              | Default | Description                                                                 |
| --------------- | --------------------------------- | ------- | --------------------------------------------------------------------------- |
| `page`          | `number`                          | —       | 제어 모드 현재 페이지(1-based).                                             |
| `defaultPage`   | `number`                          | `1`     | 비제어 모드 초기 페이지.                                                    |
| `onPageChange`  | `(page: number) => void`          | —       | 페이지 변경 콜백. 인자는 **1-based page 번호 하나만**.                      |
| `totalPages`    | `number` (필수)                   | —       | 전체 페이지 수. `0` 또는 `1`이면 Prev/Next 모두 disabled.                   |
| `siblingCount`  | `number`                          | `1`     | 현재 페이지 양쪽에 보여줄 번호 수.                                          |
| `boundaryCount` | `number`                          | `1`     | 양 끝에 고정으로 보여줄 번호 수.                                            |
| `disabled`      | `boolean`                         | `false` | 전체 disabled. 모든 서브 컴포넌트에 전파.                                   |

### 5.2. Context (`usePaginationContext`가 반환)

```ts
type PaginationEntry =
  | { type: "page"; value: number }
  | { type: "ellipsis"; key: string };

interface PaginationContextValue {
  page: number;              // 현재 페이지 (1-based)
  totalPages: number;
  pages: PaginationEntry[];  // Root가 계산한 렌더용 리스트
  onPageChange: (page: number) => void;
  isFirst: boolean;          // page <= 1
  isLast: boolean;           // page >= totalPages
  disabled: boolean;
}
```

- `Pagination.List`는 `pages`를 map으로 돌며 `Item` / `Ellipsis`를 렌더합니다. 기본 렌더를 제공하되, children을 주면 사용자가 직접 map 할 수 있습니다.
- `Pagination.Prev` / `Next` / `First` / `Last`는 내부적으로 `isFirst` / `isLast` / `totalPages`를 참조해 `disabled`를 파생합니다. 사용자는 아무 prop도 넘기지 않아도 경계 처리가 됩니다.

### 5.3. Item / Ellipsis

- `Pagination.Item`은 `value: number`를 받고, Context에서 현재 `page`와 비교해 `data-state="active" | "inactive"`, `aria-current="page"`를 파생합니다.
- `Pagination.Ellipsis`는 prop이 필요 없습니다. `aria-hidden="true"`로 렌더됩니다.

### 5.4. `data-*` 규약

- Root: `data-ui="pagination"`
- List: `data-ui="pagination-list"`
- Item: `data-ui="pagination-item"`, `data-state="active|inactive"`, `data-disabled`
- Ellipsis: `data-ui="pagination-ellipsis"`
- Prev / Next / First / Last: `data-ui="pagination-prev"` 등, 경계에서 `data-disabled`

## 6. 사용 예시 (Usage Examples)

### 6.1. 기본 모드: Prop 기반 표준 레이아웃

가장 흔한 유즈케이스. Root에 `totalPages`와 `onPageChange`만 주면 끝납니다. 내부에서 번호 리스트와 Ellipsis, Prev/Next 상태가 자동 파생됩니다.

```tsx
import { Pagination } from "frame-ui";
import { useState } from "react";

export default function ArticleList() {
  const [page, setPage] = useState(1);

  return (
    <>
      <ArticleGrid page={page} />
      <Pagination
        page={page}
        totalPages={20}
        onPageChange={setPage}
        siblingCount={1}
        boundaryCount={1}
      >
        <Pagination.Prev>이전</Pagination.Prev>
        <Pagination.List />
        <Pagination.Next>다음</Pagination.Next>
      </Pagination>
    </>
  );
}
```

### 6.2. 확장 모드: 모바일 컴팩트 레이아웃 (Prev / Next + 현재·전체 텍스트)

모바일에서는 번호 나열을 포기하고 "이전 / 3 / 20 / 다음" 식의 컴팩트 레이아웃을 자주 씁니다. Compound로 내부를 분해해 직접 조립합니다. Sticky 하단 배치 시 `safe-area-inset-bottom`을 적용하는 패턴도 같이 보여줍니다.

```tsx
import { Pagination, usePaginationContext } from "frame-ui";
import { useState } from "react";

function CompactStatus() {
  const { page, totalPages } = usePaginationContext();
  return (
    <span aria-live="polite">
      {page} / {totalPages}
    </span>
  );
}

export default function MobileFeed() {
  const [page, setPage] = useState(1);

  return (
    <Pagination page={page} totalPages={20} onPageChange={setPage}>
      {/* 하단 고정 + 홈 인디케이터 대응 */}
      <nav
        style={{
          position: "sticky",
          bottom: 0,
          paddingBottom: "env(safe-area-inset-bottom)",
          display: "flex",
          gap: 8,
        }}
      >
        <Pagination.Prev aria-label="Previous page">‹</Pagination.Prev>
        <CompactStatus />
        <Pagination.Next aria-label="Next page">›</Pagination.Next>
      </nav>
    </Pagination>
  );
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

- **사용자 직접 구현**
  - 장점: 의존성 0.
  - 단점: 1절에서 나열한 버그(Ellipsis, boundary 겹침, 1-based/0-based, `aria-current` 미사용)를 프로젝트마다 반복 구현. 페이지네이션이 필요한 모든 팀이 똑같은 뒷걸음질을 치게 됨.
- **MUI / Mantine 페이지네이션 래핑**
  - 장점: 검증된 로직, 즉시 사용 가능.
  - 단점: 스타일이 강하게 결합되어 있어 unstyled 철학과 어긋남. 디자인 시스템 전체를 그쪽에 맞추지 않는 한 CSS override 부담이 큼. FrameUI는 "스타일 없이 로직만"이라는 포지션이 있으므로 직접 제공하는 것이 일관됨.
- **무한 스크롤로 전환**
  - 장점: 모바일 탐색형 피드에서 UX가 자연스러움.
  - 단점: 3.3에서 서술한 것처럼 "위치 북마크가 중요한 리스트"(관리자 테이블, 검색 결과 재방문)에서는 부적합. 페이지네이션을 대체하는 것이 아니라 공존해야 하는 패턴임.

## 8. 결과 (Consequences)

### Positive

- Ellipsis·boundary 겹침·1-based 계산이 한 곳에 모여 버그가 수렴됩니다. 프로젝트마다 재구현하지 않아도 됩니다.
- `aria-current="page"` / `aria-hidden` / `aria-label` / `aria-disabled`가 기본 보장되어, a11y 리뷰에서 "페이지네이션 접근성 문제"가 통상적으로 제기되지 않습니다.
- Prev/Next 경계 disabled가 자동 파생되어 "첫 페이지에서 Prev 클릭 시 무반응" 같은 조용한 실패가 제거됩니다.
- 모바일 컴팩트 레이아웃도 Compound로 동일 로직을 재조립하므로, 두 벌의 페이지네이션을 유지하지 않아도 됩니다.

### Negative

- **Root 외부에서 개별 Item 재사용 불가.** Item/Ellipsis는 Context 의존이라 `<Pagination.Item value={5} />`를 Root 없이 다른 곳에서 단독 사용할 수 없습니다. 이는 Tabs/Accordion과 동일한 trade-off이며, "Root가 파생 상태를 소유한다"는 일관된 모델을 위해 의도적으로 수용합니다.
- 뷰포트 감지를 컴포넌트가 하지 않으므로, 모바일에서 `siblingCount`/`boundaryCount`를 0으로 줄이는 것은 사용자 코드의 몫입니다. 대신 API가 작아집니다.
- `asChild`로 Next.js `<Link>`에 붙일 때 prefetch/라우팅 타이밍과 `onPageChange` 호출 순서를 사용자가 맞춰야 합니다(공통 Slot 규약에 따름).

### Ongoing

- i18n: `"Previous page"` / `"Next page"` 등의 기본 `aria-label`을 전역 `Provider`로 한 번에 치환할 수 있게 할지는 별도 ADR(국제화 레이어)에서 다룹니다. 당분간은 prop override로 대응합니다.
- `page` jump input(예: "페이지로 이동" 입력창)은 1차 범위 밖이며, 필요 시 `Pagination.Jumper`를 추가 Compound로 확장할 수 있는 여지를 남겨둡니다.
- 서버 컴포넌트(RSC) 환경에서 `Pagination.Item`을 Link 기반으로 전부 SSR하는 변형은 `asChild` + `<a href>`로 이미 커버되지만, 데모 앱에 Next.js App Router 예시를 추후 추가합니다.
