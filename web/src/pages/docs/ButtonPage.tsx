import { Button } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

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

      <Section id="overview" title="Overview">
        <p>
          Button은 사용자의 클릭(또는 키보드 Enter/Space) 한 번으로 액션을 실행시키는 가장 기본적인 UI 요소입니다.
          폼 제출, 다이얼로그의 확인/취소, 페이지 이동, 데이터 저장, 결제 진행 등 웹 페이지 위에서 일어나는 거의 모든 인터랙션의 출발점이 됩니다.
          라벨 텍스트로 어떤 동작이 일어날지 사용자에게 명확하게 알려주고, 비활성화 상태로 현재 실행 불가능한 액션도 시각적으로 표현할 수 있습니다.
        </p>
      </Section>

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
