import { useState } from "react";
import { DatePicker } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { useState } from "react";
import { DatePicker } from "FrameUI";

export function Demo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <DatePicker.Root value={date} onValueChange={setDate} locale="ko-KR" />
  );
}`;

const rangeCode = `const min = new Date();
const max = new Date();
max.setMonth(max.getMonth() + 3);

<DatePicker.Root
  defaultValue={null}
  min={min}
  max={max}
  isDateDisabled={(d) => d.getDay() === 0 /* 일요일 비활성 */}
/>`;

const compoundCode = `<DatePicker.Root>
  <DatePicker.Trigger placeholder="날짜 선택" />
  <DatePicker.Content>
    <DatePicker.Calendar>
      <DatePicker.Header>
        <DatePicker.PrevMonth>‹</DatePicker.PrevMonth>
        <DatePicker.MonthLabel />
        <DatePicker.NextMonth>›</DatePicker.NextMonth>
      </DatePicker.Header>
      <DatePicker.Grid />
    </DatePicker.Calendar>
  </DatePicker.Content>
</DatePicker.Root>`;

export function DatePickerPage() {
  const [date, setDate] = useState<Date | null>(null);

  const min = new Date();
  const max = new Date();
  max.setMonth(max.getMonth() + 3);

  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="DatePicker"
        description="버튼을 누르면 달력 팝오버가 열리고, 날짜를 선택하면 자동으로 닫히는 날짜 입력 컴포넌트. Calendar 위에 trigger와 popover를 얹어 만들었습니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { DatePicker } from "FrameUI";`} />

      <Section id="overview" title="Overview">
        <p>
          DatePicker는 사용자가 정해진 칸에 직접 날짜를 타이핑하지 않고 달력에서 골라 입력하도록 도와주는 컴포넌트입니다.
          예약 시스템의 체크인/체크아웃, 일정/리마인더 등록, 생년월일 입력, 보고서 기간 필터처럼 정확한 특정 날짜를 받아야 하는 자리에 사용됩니다.
          평소에는 버튼 하나만 보이다가 누르면 달력이 팝오버로 떠오르므로 공간을 차지하지 않고,
          마우스 클릭은 물론 키보드 화살표·PageUp/Down·Home/End까지 지원해 접근성 가이드라인을 만족합니다.
          locale에 따라 월/요일 이름과 주 시작 요일이 자동으로 맞춰지고, min/max와 isDateDisabled로 선택 가능한 날짜 범위를 제한할 수 있습니다.
        </p>
      </Section>

      <Section id="basic-example" title="Basic example">
        <p>
          별다른 props 없이 <code>DatePicker.Root</code>만 두면 trigger 버튼 + 달력 팝오버 형태가 기본으로 렌더링됩니다.
          날짜를 고르면 팝오버는 자동으로 닫히고 trigger에 포커스가 돌아옵니다.
        </p>
        <Example
          preview={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <DatePicker.Root value={date} onValueChange={setDate} locale="ko-KR" />
              <span style={{ fontSize: 14, color: "var(--docs-muted)" }}>
                Selected: {date ? date.toLocaleDateString("ko-KR") : "(none)"}
              </span>
            </div>
          }
          code={basicCode}
        />
      </Section>

      <Section id="constraints" title="Min, max, and disabled dates">
        <p>
          <code>min</code>과 <code>max</code>로 선택 가능한 범위를 자르고,
          <code>isDateDisabled</code>로 특정 요일이나 휴일 같은 임의 조건의 날짜를 비활성화할 수 있습니다.
          비활성화된 날짜는 키보드 이동에서도 자동으로 건너뜁니다.
        </p>
        <Example
          preview={
            <DatePicker.Root
              defaultValue={null}
              min={min}
              max={max}
              isDateDisabled={(d) => d.getDay() === 0}
              locale="ko-KR"
            />
          }
          code={rangeCode}
        />
      </Section>

      <Section id="compound" title="Compound API">
        <p>
          내부 마크업을 직접 조립하려면 <code>Trigger</code>, <code>Content</code>, <code>Calendar</code>와
          하위 <code>Header</code>/<code>PrevMonth</code>/<code>MonthLabel</code>/<code>NextMonth</code>/<code>Grid</code>를 사용하세요.
          기본 마크업이 필요한 부분만 그대로 두고 일부만 커스터마이즈할 수도 있습니다.
        </p>
        <Example
          preview={
            <DatePicker.Root locale="ko-KR">
              <DatePicker.Trigger placeholder="날짜 선택" />
              <DatePicker.Content>
                <DatePicker.Calendar>
                  <DatePicker.Header>
                    <DatePicker.PrevMonth>‹</DatePicker.PrevMonth>
                    <DatePicker.MonthLabel />
                    <DatePicker.NextMonth>›</DatePicker.NextMonth>
                  </DatePicker.Header>
                  <DatePicker.Grid />
                </DatePicker.Calendar>
              </DatePicker.Content>
            </DatePicker.Root>
          }
          code={compoundCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <h3>DatePicker.Root</h3>
        <PropTable
          rows={[
            { prop: "value", type: "Date | null", description: "Controlled 선택 날짜." },
            { prop: "defaultValue", type: "Date | null", defaultValue: "null", description: "Uncontrolled 초기 값." },
            { prop: "onValueChange", type: "(value: Date | null) => void", description: "선택이 바뀔 때 호출." },
            { prop: "open / defaultOpen", type: "boolean", description: "팝오버 열림 상태. controlled / uncontrolled." },
            { prop: "onOpenChange", type: "(open: boolean) => void", description: "팝오버 열림 상태 변경 콜백." },
            { prop: "min", type: "Date", description: "선택 가능한 최소 날짜 (포함)." },
            { prop: "max", type: "Date", description: "선택 가능한 최대 날짜 (포함)." },
            { prop: "isDateDisabled", type: "(date: Date) => boolean", description: "임의 조건으로 날짜를 비활성화하는 함수." },
            { prop: "locale", type: "string | Intl.Locale", description: `예: "ko-KR", "en-US". 월/요일 이름과 주 시작 요일에 영향.` },
            { prop: "weekStartsOn", type: "0 | 1 | ... | 6", description: "주 시작 요일 강제 지정. 미지정 시 locale에서 추정." },
            { prop: "defaultMonth", type: "Date", description: "팝오버가 처음 열릴 때 표시할 월. 미지정 시 value 또는 오늘." },
          ]}
        />
        <h3>DatePicker.Trigger</h3>
        <PropTable
          rows={[
            { prop: "placeholder", type: "string", defaultValue: `"Pick a date"`, description: "값이 없을 때 버튼에 표시할 문구." },
            { prop: "format", type: "Intl.DateTimeFormatOptions", defaultValue: `{ dateStyle: "medium" }`, description: "선택된 날짜의 포맷." },
            { prop: "children", type: "ReactNode", description: "기본 라벨을 직접 만든 노드로 대체." },
          ]}
        />
        <h3>Sub-components</h3>
        <PropTable
          rows={[
            { prop: "DatePicker.Content", type: "div", description: "팝오버 컨테이너. 바깥 클릭과 Escape로 닫힙니다." },
            { prop: "DatePicker.Calendar", type: "Calendar.Root", description: "Root의 value/min/max/locale 등을 자동 연결한 Calendar." },
            { prop: "DatePicker.Header / PrevMonth / NextMonth / MonthLabel / Grid", type: "—", description: "Calendar의 동일 서브 컴포넌트들을 그대로 재노출. min/max에 따라 PrevMonth/NextMonth가 자동 disabled." },
          ]}
        />
      </Section>
    </article>
  );
}
