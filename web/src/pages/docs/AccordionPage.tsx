import { Accordion } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const basicCode = `import { Accordion } from "FrameUI";

export function Demo() {
  return (
    <Accordion.Root type="single" collapsible defaultValue="item-1">
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>What is FrameUI?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>A headless React component library.</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Yes — keyboard nav and ARIA are built-in.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}`;

const multipleCode = `<Accordion.Root type="multiple" defaultValue={["a", "b"]}>
  <Accordion.Item value="a">...</Accordion.Item>
  <Accordion.Item value="b">...</Accordion.Item>
</Accordion.Root>`;

export function AccordionPage() {
  return (
    <article className="page">
      <PageHeader
        category="Disclosure"
        title="Accordion"
        description="패널을 펼치고 접는 컴포넌트. type='single'은 한 번에 하나만 열리고, type='multiple'은 동시에 여러 개를 열 수 있습니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Accordion } from "FrameUI";`} />

      <Section id="overview" title="Overview">
        <p>
          Accordion은 헤더를 클릭하면 그 아래 본문이 펼쳐지고, 다시 누르면 접히는 패널 묶음입니다.
          자주 묻는 질문(FAQ), 약관/정책 문서, 모바일 사이드바 메뉴, 긴 설정 페이지의 섹션 구분처럼
          한 번에 모두 보여주기엔 양이 너무 많은 정보를 사용자가 필요한 부분만 펼쳐서 읽도록 도와줍니다.
          한 번에 하나만 열리는 single 모드는 사용자의 시선을 한 항목에 집중시키고,
          여러 개를 동시에 열 수 있는 multiple 모드는 여러 패널을 비교하며 봐야 하는 자리에서 유용합니다.
        </p>
      </Section>

      <Section id="basic-example" title="Basic example">
        <p>
          기본은 <code>type="single"</code>입니다. <code>collapsible</code>을 켜면 열려있는 항목을 다시 닫을 수 있습니다.
        </p>
        <Example
          preview={
            <Accordion.Root type="single" collapsible defaultValue="item-1" className="demo-accordion">
              <Accordion.Item value="item-1" className="demo-accordion-item">
                <Accordion.Header>
                  <Accordion.Trigger className="demo-accordion-trigger">What is FrameUI?</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="demo-accordion-content">A headless React component library.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="item-2" className="demo-accordion-item">
                <Accordion.Header>
                  <Accordion.Trigger className="demo-accordion-trigger">Is it accessible?</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="demo-accordion-content">Yes — keyboard nav and ARIA are built-in.</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          }
          code={basicCode}
        />
      </Section>

      <Section id="multiple" title="Multiple panels open">
        <p><code>type="multiple"</code>이면 <code>defaultValue</code>는 배열이 됩니다.</p>
        <Example
          preview={
            <Accordion.Root type="multiple" defaultValue={["a"]} className="demo-accordion">
              <Accordion.Item value="a" className="demo-accordion-item">
                <Accordion.Header>
                  <Accordion.Trigger className="demo-accordion-trigger">First</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="demo-accordion-content">First panel content.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="b" className="demo-accordion-item">
                <Accordion.Header>
                  <Accordion.Trigger className="demo-accordion-trigger">Second</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="demo-accordion-content">Second panel content.</Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="c" className="demo-accordion-item">
                <Accordion.Header>
                  <Accordion.Trigger className="demo-accordion-trigger">Third</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="demo-accordion-content">Third panel content.</Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          }
          code={multipleCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <h3>Accordion.Root</h3>
        <PropTable
          rows={[
            { prop: "type", type: `"single" | "multiple"`, defaultValue: `"single"`, description: "한 번에 한 개만 열지, 여러 개를 동시에 열지 결정." },
            { prop: "collapsible", type: "boolean", defaultValue: "false", description: `"single" 모드에서 열린 항목을 다시 닫을 수 있는지.` },
            { prop: "value / defaultValue", type: "string | string[]", description: "Controlled / uncontrolled 값. multiple 일 때 배열." },
            { prop: "onValueChange", type: "(value) => void", description: "값 변경 콜백." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "전체 비활성화." },
            { prop: "loop", type: "boolean", defaultValue: "true", description: "키보드 화살표로 끝에 도달했을 때 처음으로 순환." },
          ]}
        />
      </Section>
    </article>
  );
}
