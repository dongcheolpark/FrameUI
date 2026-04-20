# ADR 0006: DatePicker/Calendar 컴포넌트 (Date Picker & Calendar Component)

## 1. 배경 및 문제 (Context & Problem)

날짜 입력은 폼에서 가장 흔하게 요구되는 UI 중 하나이지만, 웹 플랫폼이 제공하는 기본 도구들은 FrameUI가 지향하는 "Headless + Accessible + 커스터마이저블"의 세 가지 축을 동시에 만족시키지 못합니다.

- **`<input type="date">`의 한계**
  - 브라우저와 운영체제마다 완전히 다른 UI가 렌더링되어, 디자인 시스템의 일관성을 보장하기 어렵습니다. (Chrome, Safari, Firefox, iOS, Android가 모두 다릅니다.)
  - 내부 UI(달력 팝오버, 스피너, 토글 등)에 대한 스타일 및 동작 커스터마이즈가 사실상 불가능합니다.
  - **범위(range) 선택, 다중(multiple) 선택, 주 단위 하이라이트** 같은 현대적 요구를 지원하지 않습니다.
  - 로캘별 날짜 표기(주 시작 요일, 월 이름, 연/월/일 순서)가 브라우저 설정에 종속되어 제품 레벨에서 제어할 수 없습니다.

- **외부 라이브러리(react-day-picker, react-datepicker 등)의 비용**
  - 대부분이 내부적으로 `date-fns`, `day.js`, `moment` 같은 날짜 라이브러리를 번들에 포함하거나 peerDependency로 강제합니다. 단순히 날짜 하나 고르려고 수십 KB의 포맷팅 라이브러리를 추가하는 것은 FrameUI의 경량 원칙과 충돌합니다.
  - 많은 라이브러리가 기본 CSS 파일을 번들에 포함하거나, className API가 제공되더라도 내부 마크업/애니메이션이 강하게 결합되어 있어 완전한 unstyled 원칙을 지키기 어렵습니다.
  - ARIA grid 패턴, 키보드 네비게이션, RTL 처리 등 접근성 구현 수준이 라이브러리마다 편차가 크고, 업데이트 주기에 의존해야 합니다.

- **모바일 특수성**
  - 모바일에서는 팝오버가 아닌 바텀시트/풀스크린 패턴이 표준화되고 있으며, 터치 타겟(최소 44×44 px), 스와이프 월 전환, 연도 빠른 점프 같은 패턴이 요구됩니다. 기본 `<input type="date">`의 네이티브 피커는 이를 부분적으로 제공하지만, 디자인 시스템과의 시각적 일관성을 해칩니다.

결론적으로, **FrameUI는 자체적으로 `Date`와 `Intl` API만 사용하는 가볍고, 완전히 unstyled이며, WAI-ARIA grid 패턴을 정확히 구현하는 DatePicker/Calendar 프리미티브**를 제공해야 합니다.

## 2. 결정 (Decision)

FrameUI는 아래 결정을 채택합니다.

1. **외부 날짜 라이브러리 의존 금지.** `date-fns`, `day.js` 등을 도입하지 않고 브라우저 내장 `Date`와 `Intl.DateTimeFormat` / `Intl.Locale`의 순수 조합만 사용합니다.
2. **두 가지 소비 형태를 공식 지원한다.**
   - `DatePicker`: `Trigger + Popover + Calendar` 구성으로 버튼을 눌러 달력이 떠오르는 전통적 형태.
   - `Calendar`: 팝오버 없이 인라인으로 렌더링되는 달력. `DatePicker`의 내부 달력과 동일 구현을 재사용합니다.
3. **선택 모드는 `mode` prop으로 통합**하되, range 전용 사용 편의를 위해 `DatePicker.RangeRoot`, `DatePicker.RangeStart`, `DatePicker.RangeEnd`를 compound로도 노출합니다.
   - `mode="single"` (기본값): 단일 날짜 선택
   - `mode="range"`: 시작/종료 두 날짜 선택
   - `mode="multiple"`: 여러 날짜 선택(토글식)
4. **타임존 정책: 모든 날짜 값은 "로컬 타임존 기준"의 `Date` 객체로 입출력**합니다. UTC 변환, ISO 직렬화, 서버 동기화 등은 사용자의 책임입니다. 라이브러리는 "어느 날짜(Calendar day)를 선택했는가"에만 집중합니다.
5. **달력 수학은 `src/internal/date.ts`로 분리**하여 Calendar 컴포넌트 자체는 렌더링/접근성/이벤트에만 집중하도록 유지합니다. (월의 첫째 날, 요일 오프셋, 월 내 일수, 주 단위 슬라이스 등)
6. 기존 컴포넌트(`Tabs`, `Switch`, `Dialog`)와 동일하게 **`data-ui`, `data-state`, `data-*` 훅 어트리뷰트 규약**을 따르며, 스타일은 전적으로 사용자의 CSS에 위임합니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

모바일에서 날짜 선택은 데스크톱과 전혀 다른 제스처와 레이아웃 기대치를 가집니다. FrameUI는 레이아웃 자체는 사용자가 결정하도록 열어두되, 아래 원칙을 라이브러리 레벨에서 보장합니다.

- **레이아웃 개방성**: `DatePicker.Content`는 팝오버 기본 동작만 제공하고, 모바일에서 이를 **풀스크린 시트 / 바텀시트 / 센터 모달** 어느 것으로 렌더할지는 사용자의 CSS/포털 선택에 맡깁니다. 라이브러리는 `data-ui="date-picker-content"`와 뷰포트 정보를 활용할 수 있는 `data-viewport`(옵션) 훅을 노출합니다.
- **터치 타겟 최소 44×44 px**: `Calendar.Day` 내부 `<button>`은 `data-ui="calendar-day"`를 가지며, 사용자가 쉽게 `min-width: 44px; min-height: 44px;` 규칙을 붙일 수 있도록 얇은 마크업을 유지합니다. 라이브러리가 강제하지는 않지만, 권장 스타일 예시를 문서에 명시합니다.
- **스와이프 월 전환(옵션)**: `Calendar`는 기본적으로 `PrevMonth`/`NextMonth` 버튼으로 월을 바꾸지만, 사용자가 Swipe 제스처를 붙일 수 있도록 `onMonthChange(direction: "prev" | "next")` 콜백을 공개합니다. FrameUI 자체가 touch 이벤트를 관리하지는 않으며, 통합 예시만 제공합니다.
- **longpress로 연도 점프(옵션)**: `MonthLabel`은 클릭 시 연도 선택 모드로 전환할 수 있는 `onLabelActivate` 콜백을 제공합니다. 구현은 사용자가 원하는 제스처(탭, 롱프레스)로 매핑할 수 있습니다.
- **네이티브 키보드 회피**: 모바일에서는 `Input` 기반 직접 편집을 기본으로 권장하지 않습니다. `DatePicker.Trigger`는 `<button>`으로 렌더되어 읽기 전용 디스플레이 역할을 하고, 실제 날짜 편집은 Grid 포커스 이동을 통해 수행됩니다. Input을 병행하고 싶다면 사용자가 `asChild`로 자신의 입력 컴포넌트를 주입할 수 있습니다.
- **세로/가로 회전 대응**: Grid는 `display: grid; grid-template-columns: repeat(7, 1fr);` 같은 간단한 CSS만으로 반응형이 되도록 7열 구조를 고정합니다. 내부적으로 sizing을 계산하지 않습니다.
- **로캘별 주 시작 요일 존중**: `Intl.Locale.prototype.getWeekInfo()` (또는 fallback)을 사용해 미국은 일요일, 대부분의 유럽/아시아 지역은 월요일로 자동 처리합니다. 사용자가 `weekStartsOn` prop으로 강제 오버라이드할 수 있습니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

FrameUI의 DatePicker/Calendar는 [WAI-ARIA Authoring Practices의 Date Picker/Grid 패턴](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)을 완전하게 구현합니다.

- **Grid 패턴 준수**
  - `Calendar.Grid`는 `role="grid"`를 가지며, `aria-labelledby`로 `MonthLabel`의 id를 참조합니다.
  - 각 `Calendar.Day`는 `role="gridcell"`을 가진 래퍼이고 실제 상호작용은 내부의 `<button>`이 담당합니다. (button에 role을 주지 않고 gridcell에 버튼을 중첩하는 것이 스크린리더 호환성이 가장 좋습니다.)
- **상태 표기**
  - 선택된 날짜: `aria-selected="true"` + `data-state="selected"`
  - 오늘: `aria-current="date"` + `data-state="today"` (선택과 독립적으로 병기 가능)
  - 비활성(min/max/`isDateDisabled`): `aria-disabled="true"` + `data-state="disabled"`. 단, **Tab 순서에서는 제거**하여 키보드 탐색이 막히지 않도록 합니다.
  - 현재 월 외(이전/다음 달의 날짜): `data-state="outside-month"`. 기본적으로 tabindex는 받지 않습니다.
- **Range 모드의 스크린리더 경험**
  - 시작과 끝: `data-state="range-start"`, `data-state="range-end"` + `aria-selected="true"`
  - 범위 내 중간 날짜: `data-state="in-range"` + `aria-selected="false"`. 대신 `aria-label`에 "n일, 범위 내"를 포함시켜 시각 장애 사용자도 범위 상황을 이해할 수 있도록 합니다.
- **월 전환 알림**: `MonthLabel`은 `aria-live="polite"`를 가지며, 월이 바뀌면 스크린리더가 "2026년 4월"처럼 새 레이블을 읽습니다.
- **키보드 네비게이션** (Grid 내부)
  - `ArrowLeft/Right/Up/Down`: 하루 또는 한 주 이동
  - `Home` / `End`: 현재 주의 시작/끝
  - `PageUp` / `PageDown`: 이전/다음 월
  - `Shift+PageUp` / `Shift+PageDown`: 이전/다음 년
  - `Enter` / `Space`: 해당 날짜 선택(또는 range의 시작/끝 갱신)
- **포커스 관리**
  - `Calendar`가 처음 마운트될 때의 초기 포커스 대상은 다음 우선순위로 결정됩니다: **(1) 현재 선택된 날짜 → (2) 오늘 → (3) `min` 날짜 → (4) 월의 첫날**.
  - 월을 전환해도 내부 상태 `focusedDay`는 "같은 일(day of month)"를 유지하려 시도합니다. (예: 4월 30일에서 PageDown을 누르면 5월 30일에 포커스)
  - `DatePicker`가 닫힐 때 포커스는 `Trigger`로 복귀합니다.
- **RTL 지원**: `dir="rtl"` 환경에서는 `ArrowLeft`와 `ArrowRight`의 의미가 자동 반전됩니다. 내부적으로 `getComputedStyle(grid).direction`을 검사하여 키 매핑을 뒤집습니다.
- **비활성일의 Tab 차단**: 비활성 날짜는 `tabIndex={-1}`로 둬서 Tab으로 멈추지 않지만, 프로그램적 포커스 이동(화살표) 시에는 건너뛰도록 합니다.

## 5. API 설계 (API Design)

### 5.1. `DatePicker` / `Calendar` Root Props

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `value` | `Date \| [Date, Date] \| Date[] \| null` | — | 제어 컴포넌트로 사용할 때의 현재 값. `mode`에 따라 타입이 달라집니다. |
| `defaultValue` | `Date \| [Date, Date] \| Date[] \| null` | `null` | 비제어 컴포넌트로 사용할 때의 초기 값. |
| `onValueChange` | `(value) => void` | — | 선택이 변경될 때 호출. `value` 타입은 `mode`와 동일. |
| `mode` | `"single" \| "range" \| "multiple"` | `"single"` | 선택 방식. |
| `min` | `Date` | — | 선택 가능한 가장 이른 날짜(로컬 타임존 기준). |
| `max` | `Date` | — | 선택 가능한 가장 늦은 날짜(로컬 타임존 기준). |
| `isDateDisabled` | `(d: Date) => boolean` | — | 개별 날짜 비활성 커스텀 규칙. `min`/`max`와 AND로 조합됩니다. |
| `locale` | `string \| Intl.Locale` | 브라우저 locale | 월/요일 이름, 주 시작 요일, 숫자 표기에 사용. |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | locale 유추 | `0=일 … 6=토`. 지정 시 `locale`의 week info를 덮어씁니다. |
| `numberOfMonths` | `number` | `1` | 한 번에 표시할 월 수(예: range용 2개월 뷰). |
| `onMonthChange` | `(month: Date) => void` | — | 표시 중인 월이 바뀔 때 호출. |

### 5.2. `mode` 별 `value` 타입 매핑

- `mode="single"` → `Date | null`
- `mode="range"` → `[Date, Date] | [Date, null] | null` (시작만 선택된 중간 상태 포함)
- `mode="multiple"` → `Date[]`

### 5.3. Compound 구조

```
DatePicker (Root)
├── DatePicker.Trigger        // <button>, 현재 값 표시
├── DatePicker.Content        // Popover 컨테이너
│   └── DatePicker.Calendar   // Calendar.Root와 동일
│       ├── Calendar.Header
│       │   ├── Calendar.PrevMonth
│       │   ├── Calendar.MonthLabel
│       │   └── Calendar.NextMonth
│       ├── Calendar.Grid     // role="grid"
│       │   └── Calendar.Day  // role="gridcell" > <button>
│       └── (반복, numberOfMonths>1일 때)
└── DatePicker.RangeRoot      // mode="range" 편의 별칭
    ├── DatePicker.RangeStart
    └── DatePicker.RangeEnd
```

`Calendar`를 단독 import해서 인라인으로 쓰는 것도 1급 시나리오이며, 이 경우 `Trigger`/`Content`는 존재하지 않습니다.

## 6. 사용 예시 (Usage Examples)

### 6.1. 기본 모드 (Prop 기반 single 선택)

```tsx
// 가장 흔한 유즈케이스. Trigger 버튼과 팝오버 달력을 한 줄로 구성합니다.
import { useState } from "react";
import { DatePicker } from "frame-ui";

export default function BirthdayField() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DatePicker
      value={date}
      onValueChange={setDate}
      min={new Date(1900, 0, 1)}
      max={new Date()}
      locale="ko-KR"
    />
  );
}
```

### 6.2. 확장 모드 (compound + range + 커스텀 헤더)

```tsx
// 호텔 예약처럼 두 달을 나란히 보여주고 범위를 선택. 헤더도 직접 조립합니다.
import { useState } from "react";
import { DatePicker, Calendar } from "frame-ui";

export default function StayRangeField() {
  const [range, setRange] = useState<[Date, Date] | [Date, null] | null>(null);

  return (
    <DatePicker.RangeRoot
      value={range}
      onValueChange={setRange}
      numberOfMonths={2}
      locale="ko-KR"
    >
      <DatePicker.Trigger asChild>
        <MyDateField label="숙박 기간" value={range} />
      </DatePicker.Trigger>

      <DatePicker.Content className="stay-sheet">
        <DatePicker.Calendar className="stay-calendar">
          <Calendar.Header className="stay-head">
            <Calendar.PrevMonth aria-label="이전 달">‹</Calendar.PrevMonth>
            <Calendar.MonthLabel className="stay-month" />
            <Calendar.NextMonth aria-label="다음 달">›</Calendar.NextMonth>
          </Calendar.Header>
          <Calendar.Grid className="stay-grid" />
        </DatePicker.Calendar>
      </DatePicker.Content>
    </DatePicker.RangeRoot>
  );
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

- **`react-day-picker`를 내부에 래핑**
  - 장점: 접근성·키보드·locale이 이미 검증되어 있고 초기 구현 비용이 낮습니다.
  - 단점: peerDependency와 CSS 결합으로 FrameUI의 "진정한 unstyled + zero-dep" 계약이 깨집니다. 내부 구조(Compound) 제어권도 제한됩니다. → 기각.
- **`date-fns`를 저수준 유틸로 의존**
  - 장점: 달력 수학(월/주/요일 계산)을 직접 구현하는 부담이 사라집니다.
  - 단점: Tree-shaking이 되더라도 사용자 번들에 수십 KB가 추가되며, 우리가 필요한 것은 `addMonths`, `startOfMonth`, `getDay` 수준의 극히 일부입니다. 자체 `internal/date.ts`에 150줄 이내로 구현 가능하다고 판단. → 기각.
- **네이티브 `<input type="date">`로 위임**
  - 장점: 구현 0줄. 접근성/모바일 피커 기본 제공.
  - 단점: range/multiple 불가, UI/locale 표기 비일관, 디자인 시스템 통합 불가. FrameUI의 존재 이유와 정면 충돌. → 기각.
- **`Temporal` API 사용**
  - 장점: `Date`의 수많은 함정을 회피.
  - 단점: 2026년 현재도 브라우저 지원이 고르지 않아 polyfill이 필요하고, 이는 "외부 의존 금지" 원칙과 충돌. → 보류(향후 브라우저 지원이 충분해지면 재평가).

## 8. 결과 (Consequences)

### Positive

- **번들 경량**: 외부 날짜 라이브러리 없이 `Date` + `Intl`만 사용하므로, 라이브러리 전체 번들 증가가 최소화됩니다(예상 ~4 KB gzip).
- **Locale 일관성**: 브라우저/OS 설정에 휘둘리지 않고, 제품이 지정한 `locale` prop으로 월·요일·주 시작을 통일합니다.
- **디자인 자유도**: 완전 unstyled 마크업과 `data-state` 훅으로 어떤 디자인 시스템에도 무난히 이식됩니다.
- **접근성 기본값**: grid 패턴과 키보드 탐색을 라이브러리 레벨에서 보장하여, 사용자가 접근성을 "잊어버려도" 큰 사고가 나지 않습니다.

### Negative

- **달력 수학 자체 구현 비용**: 윤년, 월 경계, 주 단위 슬라이스, 로캘별 첫 주 기준(ISO 8601 vs. US) 등 엣지 케이스를 `src/internal/date.ts`에서 직접 커버해야 합니다. 유닛 테스트 커버리지가 중요해집니다.
- **타임존 엣지 케이스**: `Date` 객체는 내부적으로 UTC로 저장되지만 표시는 로컬 타임존이기 때문에, 자정 경계·DST 전환일·브라우저 TZ 변경 시 "선택한 날"이 의도와 달라질 수 있습니다. 라이브러리는 항상 "로컬 타임존의 calendar day"로 해석하며, UTC 직렬화는 사용자 책임임을 문서화합니다.
- **Range 모드 UX의 복잡성**: 시작만 선택된 중간 상태, hover 시 tentative 하이라이트, 시작 이후 이전 날짜를 눌렀을 때의 리셋 정책 등은 사용자 기대치가 제품마다 달라 기본 동작에 대한 합의가 필요합니다. (기본값: "두 번째 클릭이 시작보다 이전이면 시작으로 교체")

### Ongoing

- **Intl API 브라우저 편차**: `Intl.Locale.prototype.getWeekInfo()`는 비교적 최신 API로, 미지원 브라우저에서는 하드코딩된 fallback 맵(ISO 국가 코드 → 주 시작 요일)을 사용합니다. 표준화가 성숙해지면 fallback을 제거합니다.
- **`Temporal` 이관 가능성**: `Temporal`이 Baseline에 진입하면 `internal/date.ts`를 내부적으로 교체하여 타임존 안전성을 강화하는 방안을 검토합니다. 이때에도 공개 API의 `Date` 타입은 호환성을 위해 당분간 유지합니다.
- **모바일 제스처 레시피**: 스와이프 전환, 롱프레스 연도 점프 등은 라이브러리가 강제하지 않고 문서의 "레시피"로 제공하되, 커뮤니티 피드백에 따라 훅(`useCalendarSwipe`) 형태의 옵트인 유틸로 승격할 수 있습니다.
- **`numberOfMonths > 1` 인터랙션**: 여러 달을 동시에 노출할 때 포커스 이동이 어느 Grid로 넘어갈지, `PageUp`/`PageDown`이 개별 Grid 단위인지 전체 뷰 단위인지에 대한 합의가 필요합니다. 초기 버전은 "전체 뷰 단위"로 고정하고, 필요 시 `navigationUnit` prop으로 열어줄 예정입니다.
- **포맷팅과 파싱의 분리**: 라이브러리는 `Intl.DateTimeFormat`으로 디스플레이를 포맷할 수 있는 유틸(`Calendar.formatDate`)만 제공하고, 문자열 파싱(한국어 "2026년 4월 20일" 등)은 별도 ADR에서 다룹니다. `DatePicker.Trigger`에 Input을 주입하는 시나리오는 `asChild` + 사용자 파서 조합으로 해결합니다.
