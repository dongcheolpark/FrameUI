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

      <Section id="overview" title="Overview">
        <p>
          Slider는 정해진 범위 안에서 숫자 값을 드래그로 선택하는 컨트롤입니다.
          볼륨/밝기 조절, 가격대 필터, 영상 재생 위치, 지도의 줌 레벨처럼 연속적인 값을 시각적으로 보여주면서 입력받기 좋은 자리에 사용됩니다.
          정확한 숫자보다 대략적인 강도나 범위를 빠르게 정해야 할 때, 또는 값의 변화를 즉시 미리 보여줘야 할 때 텍스트 입력보다 훨씬 직관적입니다.
        </p>
      </Section>

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
