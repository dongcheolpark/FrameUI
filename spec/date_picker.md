# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: DatePicker / Calendar
- 한 줄 설명: `Date` + `Intl` 만으로 동작하는 zero-dependency, unstyled, WAI-ARIA grid 패턴 기반 날짜 선택 컴포넌트. 인라인 `Calendar`와 팝오버 `DatePicker` 두 형태를 동일 코어로 제공한다.

자세한 배경/대안/트레이드오프는 [ADR 0006](../Adr/0006-date-picker-component.md)을 참조한다. 본 스펙은 **MVP 범위**(`mode="single"`, `numberOfMonths=1`)에 집중하며, range/multiple 및 다중 월 뷰는 후속 PR로 분리한다.

## 2. 해결할 문제

- `<input type="date">`는 브라우저·OS마다 UI가 완전히 달라 디자인 시스템의 일관성을 깨고, 내부 마크업·로캘·주 시작 요일을 제품 레벨에서 제어할 수 없다.
- `react-day-picker`, `react-datepicker` 같은 라이브러리는 `date-fns`/`day.js`를 peerDependency나 번들로 끌고 들어와 FrameUI의 zero-dep / 경량 원칙과 충돌하고, 내부 CSS·마크업 결합이 강해 "완전한 unstyled"를 보장하지 않는다.
- 직접 구현하면 윤년·DST·월 경계·로캘별 첫 주 같은 달력 수학 엣지케이스가 잦고, WAI-ARIA grid 패턴(키보드 네비게이션, `aria-live` 월 전환 알림, 비활성일 Tab 차단)을 빠짐없이 충족하기 어렵다.
- 동일 코어를 인라인 사용(`Calendar`)과 팝오버 사용(`DatePicker`) 양쪽에서 재사용하려면, 코어 상태(현재 월, 포커스된 날, 선택값, 로캘)를 명시적으로 분리해 두 컨테이너가 같은 컨텍스트를 공유해야 한다.

## 3. 필요한 필수 기능

1. **외부 날짜 라이브러리 금지.** 브라우저 내장 `Date`와 `Intl.DateTimeFormat` / `Intl.Locale` 만 사용한다. 달력 수학(`startOfMonth`, `addMonths`, `buildMonthGrid`, `getWeekStartsOn` 등)은 `src/internal/date.ts` 한 곳에 모아 컴포넌트에서 분리하고 단위 테스트로 보장한다.

2. **두 가지 소비 형태를 동일 코어로 제공.**
   - `Calendar`: 인라인 렌더링 (`Calendar.Root` > `Calendar.Header` / `Calendar.Grid` / `Calendar.Day`).
   - `DatePicker`: `DatePicker.Root` > `DatePicker.Trigger` + `DatePicker.Content` > `DatePicker.Calendar` 로 팝오버 형태. 내부 달력은 `Calendar`와 동일 컴포넌트를 재사용한다.

3. **Controlled / Uncontrolled 양쪽 지원.** `value` / `defaultValue` / `onValueChange` 규약을 따른다. MVP에서 `mode="single"` 하나만 지원하므로 값 타입은 `Date | null`로 고정한다.

4. **선택 제약.** `min`, `max`, `isDateDisabled(d)` 세 가지를 AND로 조합해 비활성일을 결정한다. 비활성 날짜는 `aria-disabled="true"` + `data-state="disabled"` + `tabIndex={-1}` 으로 Tab 순서에서 제거하되, 화살표 키 탐색에서도 건너뛴다.

5. **로캘 처리.** `locale` prop(`string | Intl.Locale`, 기본은 브라우저 locale)로 월 이름·요일 이름·숫자 표기를 결정한다. 주 시작 요일은 `Intl.Locale.prototype.getWeekInfo()`를 우선 사용하고, 미지원 브라우저는 국가코드 → 시작 요일 fallback 맵으로 대체한다. `weekStartsOn` prop(`0..6`)을 주면 로캘 추론을 덮어쓴다.

6. **WAI-ARIA grid 패턴 준수.**
   - `Calendar.Grid`: `role="grid"` + `aria-labelledby={MonthLabel.id}`.
   - `Calendar.Day`: `role="gridcell"` 래퍼 안에 실제 인터랙션을 담당하는 `<button>` 중첩.
   - 상태 표기: 선택 `aria-selected="true"` + `data-state="selected"`, 오늘 `aria-current="date"` + `data-state="today"`, 비활성 `aria-disabled="true"` + `data-state="disabled"`, 현재 월 외 `data-state="outside-month"`.
   - `MonthLabel`은 `aria-live="polite"`로 월 전환 시 새 레이블을 스크린리더가 읽도록 한다.

7. **키보드 네비게이션 (Grid 내부).**
   - `ArrowLeft/Right/Up/Down`: 하루 / 한 주 이동
   - `Home` / `End`: 현재 주의 시작 / 끝
   - `PageUp` / `PageDown`: 이전 / 다음 월
   - `Shift+PageUp` / `Shift+PageDown`: 이전 / 다음 년
   - `Enter` / `Space`: 해당 날짜 선택
   - 초기 포커스 우선순위: **선택값 → 오늘 → `min` → 월의 첫날**.
   - 월 전환 시 내부 `focusedDay`는 같은 day-of-month를 유지하려 시도한다(말일 처리 포함).

8. **`DatePicker` 팝오버 동작.** `Trigger` 클릭/`Enter`/`Space`로 열기, 외부 클릭 또는 `Esc`로 닫기, 날짜 선택 시 자동 닫기. 닫힐 때 포커스는 `Trigger`로 복귀한다. MVP에서는 포털 없이 `Trigger` 기준 `position: absolute`로 단순 배치한다(고도화된 anchored positioning은 후속).

9. **`data-*` 계약을 통한 unstyled 스타일링.** `data-ui="calendar-root | calendar-grid | calendar-day | date-picker-trigger | date-picker-content"` 등과 `data-state`를 모든 경로에서 동일하게 노출해, 사용자가 CSS만으로 진입/퇴장·테마·hover 하이라이트를 연결할 수 있어야 한다.
