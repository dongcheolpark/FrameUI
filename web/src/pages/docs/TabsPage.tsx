import { Tabs } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const basicCode = `import { Tabs } from "FrameUI";

export function Demo() {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="usage">Usage</Tabs.Trigger>
        <Tabs.Trigger value="api">API</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Overview content</Tabs.Content>
      <Tabs.Content value="usage">Usage content</Tabs.Content>
      <Tabs.Content value="api">API content</Tabs.Content>
    </Tabs.Root>
  );
}`;

const verticalCode = `<Tabs.Root defaultValue="a" orientation="vertical">
  <Tabs.List>
    <Tabs.Trigger value="a">A</Tabs.Trigger>
    <Tabs.Trigger value="b">B</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">A panel</Tabs.Content>
  <Tabs.Content value="b">B panel</Tabs.Content>
</Tabs.Root>`;

const automaticCode = `<Tabs.Root defaultValue="a" activationMode="automatic">
  <Tabs.List>...</Tabs.List>
</Tabs.Root>`;

export function TabsPage() {
  return (
    <article className="page">
      <PageHeader
        category="Navigation"
        title="Tabs"
        description="ARIA 패턴을 따르는 탭. 키보드 화살표로 이동하고, automatic 모드에서는 포커스 이동만으로 활성화됩니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Tabs } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <Tabs.Root defaultValue="overview" className="demo-tabs">
              <Tabs.List className="demo-tabs-list">
                <Tabs.Trigger value="overview" className="demo-tabs-trigger">Overview</Tabs.Trigger>
                <Tabs.Trigger value="usage" className="demo-tabs-trigger">Usage</Tabs.Trigger>
                <Tabs.Trigger value="api" className="demo-tabs-trigger">API</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="overview" className="demo-tabs-content">Overview content</Tabs.Content>
              <Tabs.Content value="usage" className="demo-tabs-content">Usage content</Tabs.Content>
              <Tabs.Content value="api" className="demo-tabs-content">API content</Tabs.Content>
            </Tabs.Root>
          }
          code={basicCode}
        />
      </Section>

      <Section id="vertical" title="Vertical orientation">
        <p><code>orientation="vertical"</code>로 설정하면 ↑/↓로 이동합니다.</p>
        <Example
          preview={
            <Tabs.Root defaultValue="a" orientation="vertical" className="demo-tabs demo-tabs-vertical">
              <Tabs.List className="demo-tabs-list demo-tabs-list-vertical">
                <Tabs.Trigger value="a" className="demo-tabs-trigger">A</Tabs.Trigger>
                <Tabs.Trigger value="b" className="demo-tabs-trigger">B</Tabs.Trigger>
                <Tabs.Trigger value="c" className="demo-tabs-trigger">C</Tabs.Trigger>
              </Tabs.List>
              <div>
                <Tabs.Content value="a" className="demo-tabs-content">Panel A</Tabs.Content>
                <Tabs.Content value="b" className="demo-tabs-content">Panel B</Tabs.Content>
                <Tabs.Content value="c" className="demo-tabs-content">Panel C</Tabs.Content>
              </div>
            </Tabs.Root>
          }
          code={verticalCode}
        />
      </Section>

      <Section id="activation-mode" title="Activation mode">
        <p>
          기본은 <code>"manual"</code>: 포커스 이동만으로는 활성 탭이 바뀌지 않고 Enter/Space나 클릭이 필요합니다.
          <code>"automatic"</code>으로 바꾸면 화살표로 포커스가 이동할 때마다 자동 활성화됩니다.
        </p>
        <Example
          preview={
            <Tabs.Root defaultValue="a" activationMode="automatic" className="demo-tabs">
              <Tabs.List className="demo-tabs-list">
                <Tabs.Trigger value="a" className="demo-tabs-trigger">Auto A</Tabs.Trigger>
                <Tabs.Trigger value="b" className="demo-tabs-trigger">Auto B</Tabs.Trigger>
                <Tabs.Trigger value="c" className="demo-tabs-trigger">Auto C</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="a" className="demo-tabs-content">Panel A</Tabs.Content>
              <Tabs.Content value="b" className="demo-tabs-content">Panel B</Tabs.Content>
              <Tabs.Content value="c" className="demo-tabs-content">Panel C</Tabs.Content>
            </Tabs.Root>
          }
          code={automaticCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <h3>Tabs.Root</h3>
        <PropTable
          rows={[
            { prop: "value", type: "string", description: "Controlled 활성 탭." },
            { prop: "defaultValue", type: "string", description: "Uncontrolled 초기 활성 탭." },
            { prop: "onValueChange", type: "(value: string) => void", description: "활성 탭이 바뀔 때 호출." },
            { prop: "orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "키보드 방향 결정." },
            { prop: "activationMode", type: `"automatic" | "manual"`, defaultValue: `"manual"`, description: "포커스 이동 시 활성화 여부." },
          ]}
        />
        <h3>Tabs.Trigger</h3>
        <PropTable
          rows={[
            { prop: "value", type: "string", description: "이 트리거가 가리키는 탭의 식별자. 필수." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "비활성화. 키보드 순회에서 제외됩니다." },
          ]}
        />
        <h3>Tabs.Content</h3>
        <PropTable
          rows={[
            { prop: "value", type: "string", description: "이 컨텐츠가 속한 탭의 식별자. 필수." },
            { prop: "forceMount", type: "boolean", description: "true면 비활성 시에도 DOM에 유지(hidden 처리)." },
          ]}
        />
      </Section>
    </article>
  );
}
