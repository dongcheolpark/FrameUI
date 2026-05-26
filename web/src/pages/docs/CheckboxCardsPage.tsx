import { useState } from "react";
import { CheckboxCards } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const basicCode = `import { CheckboxCards } from "FrameUI";

export function Demo() {
  return (
    <CheckboxCards
      defaultValue={["frontend"]}
      options={[
        { value: "design", label: "Design", description: "UI work" },
        { value: "frontend", label: "Frontend", description: "React" },
        { value: "backend", label: "Backend", description: "Node, Go" },
      ]}
    />
  );
}`;

const compoundCode = `<CheckboxCards.Root defaultValue={["a"]}>
  <CheckboxCards.Item value="a">
    <CheckboxCards.Indicator />
    <div>
      <CheckboxCards.Label>Custom A</CheckboxCards.Label>
      <CheckboxCards.Description>Compose your own layout</CheckboxCards.Description>
    </div>
  </CheckboxCards.Item>
</CheckboxCards.Root>`;

const controlledCode = `const [value, setValue] = useState<string[]>(["a"]);

<CheckboxCards
  value={value}
  onValueChange={setValue}
  options={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ]}
/>`;

export function CheckboxCardsPage() {
  const [value, setValue] = useState<string[]>(["a"]);
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="CheckboxCards"
        description="여러 항목을 선택할 수 있는 카드형 체크박스 그룹. options 배열로 단축하거나 컴파운드 컴포넌트로 직접 조립할 수 있습니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { CheckboxCards } from "FrameUI";`} />

      <Section id="overview" title="Overview">
        <p>
          CheckboxCards는 여러 선택지 중에서 0개 이상을 동시에 고를 수 있는 카드 형태의 다중 선택 컴포넌트입니다.
          회원가입에서 관심사 고르기, 상품 필터의 다중 조건, 권한 설정, 알림 수신 항목 선택 같은 자리에서 사용됩니다.
          작은 사각형 체크박스 대신 클릭 영역이 넓은 카드 한 칸 전체가 토글되기 때문에 모바일에서도 누르기 쉽고,
          각 카드 안에 라벨과 부가 설명을 함께 노출할 수 있어 옵션의 의미를 더 명확하게 전달할 수 있습니다.
        </p>
      </Section>

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <CheckboxCards
              defaultValue={["frontend"]}
              options={[
                { value: "design", label: "Design", description: "UI work" },
                { value: "frontend", label: "Frontend", description: "React" },
                { value: "backend", label: "Backend", description: "Node, Go" },
              ]}
            />
          }
          code={basicCode}
        />
      </Section>

      <Section id="controlled" title="Controlled value">
        <p><code>value</code>는 선택된 값들의 배열입니다.</p>
        <Example
          preview={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CheckboxCards
                value={value}
                onValueChange={setValue}
                options={[
                  { value: "a", label: "Option A" },
                  { value: "b", label: "Option B" },
                  { value: "c", label: "Option C" },
                ]}
              />
              <span style={{ fontSize: 14, color: "var(--docs-muted)" }}>
                Selected: [{value.join(", ")}]
              </span>
            </div>
          }
          code={controlledCode}
        />
      </Section>

      <Section id="compound" title="Compound components">
        <p>커스텀 레이아웃이 필요하면 컴파운드 컴포넌트로 자유롭게 조립하세요.</p>
        <Example
          preview={
            <CheckboxCards.Root defaultValue={["a"]}>
              <CheckboxCards.Item value="a">
                <CheckboxCards.Indicator />
                <div>
                  <CheckboxCards.Label>Custom A</CheckboxCards.Label>
                  <CheckboxCards.Description>Compose your own layout</CheckboxCards.Description>
                </div>
              </CheckboxCards.Item>
              <CheckboxCards.Item value="b">
                <CheckboxCards.Indicator />
                <div>
                  <CheckboxCards.Label>Custom B</CheckboxCards.Label>
                </div>
              </CheckboxCards.Item>
            </CheckboxCards.Root>
          }
          code={compoundCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "options", type: "CheckboxCardOption[]", description: "{ value, label, description?, disabled? } 배열로 빠르게 렌더링." },
            { prop: "value", type: "string[]", description: "Controlled 선택값 배열." },
            { prop: "defaultValue", type: "string[]", defaultValue: "[]", description: "Uncontrolled 초기 선택값." },
            { prop: "onValueChange", type: "(value: string[]) => void", description: "선택이 바뀔 때 호출." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "전체 그룹 비활성화." },
            { prop: "invalid", type: "boolean", defaultValue: "false", description: "data-invalid 적용." },
          ]}
        />
      </Section>
    </article>
  );
}
