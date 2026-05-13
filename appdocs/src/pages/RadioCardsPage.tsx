import { useState } from "react";
import { RadioCards } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { RadioCards } from "FrameUI";

export function Demo() {
  return (
    <RadioCards
      defaultValue="apple"
      name="fruit"
      options={[
        { value: "apple", label: "Apple", description: "crisp" },
        { value: "banana", label: "Banana", description: "tropical" },
        { value: "cherry", label: "Cherry", description: "sweet" },
      ]}
    />
  );
}`;

const controlledCode = `const [value, setValue] = useState("apple");

<RadioCards value={value} onValueChange={setValue} name="fruit" options={[...]} />`;

const compoundCode = `<RadioCards.Root defaultValue="a" name="custom">
  <RadioCards.Item value="a">
    <RadioCards.Indicator />
    <div>
      <RadioCards.Label>Custom A</RadioCards.Label>
      <RadioCards.Description>With your own layout</RadioCards.Description>
    </div>
  </RadioCards.Item>
</RadioCards.Root>`;

export function RadioCardsPage() {
  const [value, setValue] = useState("apple");
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="RadioCards"
        description="단일 선택용 카드형 라디오 그룹. CheckboxCards와 같은 API 형태이지만 단일 string 값을 가집니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { RadioCards } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <RadioCards
              defaultValue="apple"
              name="fruit-basic"
              options={[
                { value: "apple", label: "Apple", description: "crisp" },
                { value: "banana", label: "Banana", description: "tropical" },
                { value: "cherry", label: "Cherry", description: "sweet" },
              ]}
            />
          }
          code={basicCode}
        />
      </Section>

      <Section id="controlled" title="Controlled value">
        <Example
          preview={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <RadioCards
                value={value}
                onValueChange={setValue}
                name="fruit-controlled"
                options={[
                  { value: "apple", label: "Apple" },
                  { value: "banana", label: "Banana" },
                  { value: "cherry", label: "Cherry" },
                ]}
              />
              <span style={{ fontSize: 14, color: "var(--docs-muted)" }}>Selected: {value}</span>
            </div>
          }
          code={controlledCode}
        />
      </Section>

      <Section id="compound" title="Compound components">
        <Example
          preview={
            <RadioCards.Root defaultValue="a" name="custom">
              <RadioCards.Item value="a">
                <RadioCards.Indicator />
                <div>
                  <RadioCards.Label>Custom A</RadioCards.Label>
                  <RadioCards.Description>With your own layout</RadioCards.Description>
                </div>
              </RadioCards.Item>
              <RadioCards.Item value="b">
                <RadioCards.Indicator />
                <div>
                  <RadioCards.Label>Custom B</RadioCards.Label>
                </div>
              </RadioCards.Item>
            </RadioCards.Root>
          }
          code={compoundCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "options", type: "RadioCardOption[]", description: "{ value, label, description?, disabled? } 배열." },
            { prop: "value", type: "string", description: "Controlled 선택값." },
            { prop: "defaultValue", type: "string", description: "Uncontrolled 초기 선택값." },
            { prop: "onValueChange", type: "(value: string) => void", description: "선택이 바뀔 때 호출." },
            { prop: "name", type: "string", description: "내부 input의 name. 폼 제출 시 사용." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "전체 그룹 비활성화." },
            { prop: "invalid", type: "boolean", defaultValue: "false", description: "data-invalid 적용." },
          ]}
        />
      </Section>
    </article>
  );
}
