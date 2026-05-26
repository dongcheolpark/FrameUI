import { useState } from "react";
import { Switch } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const basicCode = `import { Switch } from "FrameUI";

export function Demo() {
  return <Switch defaultChecked aria-label="Enable notifications" />;
}`;

const controlledCode = `const [checked, setChecked] = useState(false);

<Switch checked={checked} onCheckedChange={setChecked} aria-label="Wifi" />`;

const disabledCode = `<Switch defaultChecked disabled aria-label="Locked setting" />`;

export function SwitchPage() {
  const [checked, setChecked] = useState(true);
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="Switch"
        description="boolean 토글을 표현하는 스위치. 네이티브 checkbox 입력을 시각적으로 가린 후 data-state로 상태를 노출합니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Switch } from "FrameUI";`} />

      <Section id="overview" title="Overview">
        <p>
          Switch는 켜짐과 꺼짐, 두 상태 중 하나를 즉시 전환하는 토글 컨트롤입니다.
          알림 수신 여부, 다크 모드, Wi-Fi 같은 설정 페이지의 on/off 항목이나, 어떤 기능을 활성/비활성하는 자리에서 자주 쓰입니다.
          사용자가 토글을 움직이는 순간 변경이 바로 반영되는 시나리오에 적합하며, "저장" 버튼을 누르기 전까지 적용을 미뤄야 하는 경우에는 일반 체크박스가 더 어울립니다.
        </p>
      </Section>

      <Section id="basic-example" title="Basic example">
        <p>제어하지 않는 경우 <code>defaultChecked</code>로 초기 상태를 지정하면 됩니다.</p>
        <Example
          preview={<Switch defaultChecked aria-label="Demo switch" />}
          code={basicCode}
        />
      </Section>

      <Section id="controlled" title="Controlled value">
        <p>
          <code>checked</code>와 <code>onCheckedChange</code>를 함께 넘기면 controlled 모드로 동작합니다.
          <code>onCheckedChange</code>는 다음 상태(boolean)를 인자로 받습니다.
        </p>
        <Example
          preview={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Switch checked={checked} onCheckedChange={setChecked} aria-label="Controlled switch" />
              <span style={{ fontSize: 14, color: "var(--docs-muted)" }}>{checked ? "On" : "Off"}</span>
            </div>
          }
          code={controlledCode}
        />
      </Section>

      <Section id="disabled" title="Disabled">
        <p>비활성화하면 클릭과 키보드 토글이 모두 막히고 <code>data-disabled</code>가 적용됩니다.</p>
        <Example preview={<Switch defaultChecked disabled aria-label="Disabled" />} code={disabledCode} />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "checked", type: "boolean", description: "Controlled 상태에서 현재 값." },
            { prop: "defaultChecked", type: "boolean", defaultValue: "false", description: "Uncontrolled 모드에서 초기 값." },
            { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "값이 바뀔 때 호출됩니다." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "비활성화 여부." },
            { prop: "...rest", type: "InputHTMLAttributes<HTMLInputElement>", description: "aria-label 등 input 속성을 위임. checked/defaultChecked/onChange/type은 가려져 있습니다." },
          ]}
        />
      </Section>
    </article>
  );
}
