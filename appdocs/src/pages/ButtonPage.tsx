import { Button } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { Button } from "FrameUI";

export function Demo() {
  return <Button label="Click me" onClick={() => console.log("clicked")} />;
}`;

const disabledCode = `<Button label="Disabled" disabled />`;

const typeCode = `<form onSubmit={...}>
  <Button label="Submit" type="submit" />
</form>`;

export function ButtonPage() {
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="Button"
        description="네이티브 <button> 위에 만들어진 가장 단순한 컴포넌트로, label prop을 받고 나머지 모든 button 속성을 그대로 위임합니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Button } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <p>
          <code>label</code>은 필수이며, 그 외에는 표준 <code>ButtonHTMLAttributes</code>를 그대로 받습니다.
          <code>type</code> 기본값은 <code>"button"</code>이라 폼 안에서 의도치 않은 submit을 방지합니다.
        </p>
        <Example
          preview={<Button label="Click me" onClick={() => alert("clicked")} />}
          code={basicCode}
        />
      </Section>

      <Section id="disabled" title="Disabled state">
        <p>네이티브 <code>disabled</code> 속성을 그대로 사용합니다.</p>
        <Example preview={<Button label="Disabled" disabled />} code={disabledCode} />
      </Section>

      <Section id="submit" title="Submit button">
        <p>폼 제출용으로 사용할 때는 <code>type="submit"</code>을 명시하세요.</p>
        <Example
          preview={<Button label="Submit" type="submit" />}
          code={typeCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            {
              prop: "label",
              type: "string",
              description: "버튼 안에 표시될 텍스트. 필수 prop입니다.",
            },
            {
              prop: "type",
              type: `"button" | "submit" | "reset"`,
              defaultValue: `"button"`,
              description: "네이티브 button type. 명시하지 않으면 기본 동작에서 폼 submit을 트리거하지 않습니다.",
            },
            {
              prop: "...rest",
              type: "ButtonHTMLAttributes<HTMLButtonElement>",
              description: "onClick, disabled, aria-* 등 모든 표준 button 속성을 그대로 전달합니다.",
            },
          ]}
        />
      </Section>
    </article>
  );
}
