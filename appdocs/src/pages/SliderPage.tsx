import { useState } from "react";
import { Slider } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { Slider } from "FrameUI";

export function Demo() {
  return <Slider defaultValue={40} aria-label="Volume" />;
}`;

const controlledCode = `const [value, setValue] = useState(40);

<Slider value={value} onValueChange={setValue} aria-label="Volume" />`;

const rangeCode = `<Slider defaultValue={50} min={0} max={200} step={10} aria-label="Brightness" />`;

export function SliderPage() {
  const [value, setValue] = useState(40);
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="Slider"
        description="네이티브 range input을 래핑한 슬라이더. min/max/step과 controlled 패턴을 지원하고 percent를 data-percent로 노출합니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Slider } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <div style={{ width: 280 }}>
              <Slider defaultValue={40} aria-label="Volume" />
            </div>
          }
          code={basicCode}
        />
      </Section>

      <Section id="controlled" title="Controlled value">
        <p><code>onValueChange</code>는 number를 인자로 받아 호출됩니다.</p>
        <Example
          preview={
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 280 }}>
              <Slider value={value} onValueChange={setValue} aria-label="Controlled slider" />
              <span style={{ fontSize: 14, color: "var(--docs-muted)" }}>Value: {value}</span>
            </div>
          }
          code={controlledCode}
        />
      </Section>

      <Section id="range" title="Custom range and step">
        <p><code>min</code>, <code>max</code>, <code>step</code>으로 범위와 단위를 조절할 수 있습니다.</p>
        <Example
          preview={
            <div style={{ width: 280 }}>
              <Slider defaultValue={50} min={0} max={200} step={10} aria-label="Brightness" />
            </div>
          }
          code={rangeCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "value", type: "number", description: "Controlled 값." },
            { prop: "defaultValue", type: "number", defaultValue: "0", description: "Uncontrolled 초기 값." },
            { prop: "onValueChange", type: "(value: number) => void", description: "값이 바뀔 때 호출." },
            { prop: "min", type: "number", defaultValue: "0", description: "최솟값." },
            { prop: "max", type: "number", defaultValue: "100", description: "최댓값." },
            { prop: "step", type: "number", defaultValue: "1", description: "단위." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "비활성화 여부." },
          ]}
        />
      </Section>
    </article>
  );
}
