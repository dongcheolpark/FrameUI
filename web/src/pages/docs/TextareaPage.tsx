import { Button, Textarea } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const basicCode = `import { Textarea } from "FrameUI";

export function Demo() {
  return <Textarea placeholder="Leave a comment…" minRows={2} maxRows={6} />;
}`;

const compoundCode = `<Textarea.Root>
  <Textarea.Input placeholder="Compound API" minRows={3} />
  <Textarea.Action>
    <Button label="Send" />
  </Textarea.Action>
</Textarea.Root>`;

const submitCode = `<Textarea
  placeholder="Press Enter to submit, Shift+Enter for newline"
  enterKeyBehavior="submit"
  onSubmitEnter={(value) => console.log("submit", value)}
/>`;

const slotCode = `<Textarea
  placeholder="With action slot"
  minRows={2}
  maxRows={4}
  actionSlot={<Button label="Send" />}
/>`;

export function TextareaPage() {
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="Textarea"
        description="입력에 따라 줄 수가 자동으로 늘어나는 textarea. minRows/maxRows로 범위를 제한하고, 상단 컴파운드 API와 단축 actionSlot 두 가지 방식을 지원합니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Textarea } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <div style={{ width: 320 }}>
              <Textarea placeholder="Leave a comment…" minRows={2} maxRows={6} />
            </div>
          }
          code={basicCode}
        />
      </Section>

      <Section id="action-slot" title="Action slot">
        <p>오른쪽 하단에 send 버튼 같은 요소를 붙일 때 <code>actionSlot</code>을 사용합니다.</p>
        <Example
          preview={
            <div style={{ width: 320 }}>
              <Textarea
                placeholder="With action slot"
                minRows={2}
                maxRows={4}
                actionSlot={<Button label="Send" />}
              />
            </div>
          }
          code={slotCode}
        />
      </Section>

      <Section id="compound" title="Compound API">
        <p>
          더 세밀하게 구성하려면 <code>Textarea.Root</code>, <code>Textarea.Input</code>, <code>Textarea.Action</code>으로 직접 조립할 수 있습니다.
        </p>
        <Example
          preview={
            <div style={{ width: 320 }}>
              <Textarea.Root>
                <Textarea.Input placeholder="Compound API" minRows={3} />
                <Textarea.Action>
                  <Button label="Send" />
                </Textarea.Action>
              </Textarea.Root>
            </div>
          }
          code={compoundCode}
        />
      </Section>

      <Section id="submit-on-enter" title="Submit on Enter">
        <p>
          <code>enterKeyBehavior="submit"</code>로 설정하면 Enter는 submit, Shift+Enter는 줄바꿈으로 동작합니다.
          IME 조합 중에는 자동으로 무시됩니다.
        </p>
        <Example
          preview={
            <div style={{ width: 320 }}>
              <Textarea
                placeholder="Press Enter to submit"
                enterKeyBehavior="submit"
                onSubmitEnter={(value) => alert(`submit: ${value}`)}
              />
            </div>
          }
          code={submitCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "value", type: "string", description: "Controlled 값." },
            { prop: "defaultValue", type: "string", defaultValue: `""`, description: "Uncontrolled 초기 값." },
            { prop: "onValueChange", type: "(value: string) => void", description: "값이 바뀔 때 호출." },
            { prop: "minRows", type: "number", defaultValue: "1", description: "최소 줄 수." },
            { prop: "maxRows", type: "number", description: "최대 줄 수. 초과 시 스크롤." },
            { prop: "enterKeyBehavior", type: `"newline" | "submit"`, defaultValue: `"newline"`, description: `"submit"이면 Enter로 onSubmitEnter 호출.` },
            { prop: "onSubmitEnter", type: "(value, event) => void", description: "submit 모드에서 Enter 입력 시 호출." },
            { prop: "invalid", type: "boolean", defaultValue: "false", description: "data-invalid 및 aria-invalid 적용." },
            { prop: "actionSlot", type: "ReactNode", description: "오른쪽 슬롯에 렌더되는 요소." },
            { prop: "rootProps", type: "TextareaRootProps", description: "Root div에 전달할 props." },
          ]}
        />
      </Section>
    </article>
  );
}
