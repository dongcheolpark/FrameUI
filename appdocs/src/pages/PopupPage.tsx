import { useState } from "react";
import { Button, Popup } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { useState } from "react";
import { Button, Popup } from "FrameUI";

export function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Show toast" onClick={() => setOpen(true)} />
      <Popup
        isOpen={open}
        onOpenChange={setOpen}
        message="저장되었습니다"
        type="success"
        duration={2000}
      />
    </>
  );
}`;

const typesCode = `<Popup type="info"    message="알림" />
<Popup type="success" message="완료" />
<Popup type="error"   message="에러" />`;

export function PopupPage() {
  const [open, setOpen] = useState<{ type: "info" | "success" | "error" } | null>(null);
  return (
    <article className="page">
      <PageHeader
        category="Overlays"
        title="Popup"
        description="자동으로 사라지는 토스트 형태의 알림. duration이 지나면 onOpenChange(false)가 호출됩니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Popup } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <>
              <Button label="Show toast" onClick={() => setOpen({ type: "success" })} />
              <Popup
                isOpen={open?.type === "success"}
                onOpenChange={() => setOpen(null)}
                message="저장되었습니다"
                type="success"
                duration={2000}
              />
            </>
          }
          code={basicCode}
        />
      </Section>

      <Section id="types" title="Types">
        <p><code>type</code>은 <code>"info" | "success" | "error"</code> 중 하나이며 <code>.popup-{`{type}`}</code> 클래스가 적용됩니다.</p>
        <Example
          preview={
            <div style={{ display: "flex", gap: 8 }}>
              <Button label="Info" onClick={() => setOpen({ type: "info" })} />
              <Button label="Success" onClick={() => setOpen({ type: "success" })} />
              <Button label="Error" onClick={() => setOpen({ type: "error" })} />
              {open && (
                <Popup
                  isOpen
                  onOpenChange={() => setOpen(null)}
                  message={`${open.type} message`}
                  type={open.type}
                  duration={2000}
                />
              )}
            </div>
          }
          code={typesCode}
        />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "isOpen", type: "boolean", description: "Controlled 열림 상태." },
            { prop: "defaultOpen", type: "boolean", defaultValue: "false", description: "Uncontrolled 초기 상태." },
            { prop: "onOpenChange", type: "(open: boolean) => void", description: "duration 만료/닫기 버튼 클릭 시 false로 호출." },
            { prop: "message", type: "string", description: "표시할 메시지." },
            { prop: "type", type: `"info" | "success" | "error"`, defaultValue: `"info"`, description: "팝업 종류." },
            { prop: "duration", type: "number", defaultValue: "3000", description: "자동으로 닫히기까지의 시간(ms). 0 이하면 자동 닫힘 비활성." },
          ]}
        />
      </Section>
    </article>
  );
}
