import { useState } from "react";
import { Button, Popup } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

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
  const [open, setOpen] = useState<{
    type: "info" | "success" | "error";
  } | null>(null);
  return (
    <article className="page">
      <PageHeader
        category="Overlays"
        title="Popup"
        description="자동으로 사라지는 토스트 형태의 알림. duration이 지나면 onOpenChange(false)가 호출됩니다."
      />

      <Install
        npm="npm install @frameui57/frame-ui"
        importStmt={`import { Popup } from "FrameUI";`}
      />

      <Section id="overview" title="Overview">
        <p>
          Popup은 사용자의 작업 흐름을 막지 않고 화면 위에 잠시 떴다가 자동으로
          사라지는 알림 메시지입니다. "저장되었습니다", "복사 완료", "네트워크
          오류" 같은 짧은 상태/결과 메시지를 사용자에게 가볍게 전달할 때
          사용합니다. info, success, error 세 가지 타입으로 메시지의
          의미(중립/긍정/부정)를 색과 아이콘으로 함께 전달하고, duration이
          지나면 스스로 사라지기 때문에 사용자가 일일이 닫지 않아도 됩니다. 더
          큰 스택과 액션 버튼이 필요하다면 Toast 컴포넌트를 사용하세요.
        </p>
      </Section>

      <Section id="basic-example" title="Basic example">
        <Example
          preview={
            <>
              <Button
                label="Show toast"
                onClick={() => setOpen({ type: "success" })}
              />
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
        <p>
          <code>type</code>은 <code>"info" | "success" | "error"</code> 중
          하나이며 <code>.popup-{`{type}`}</code> 클래스가 적용됩니다.
        </p>
        <Example
          preview={
            <div style={{ display: "flex", gap: 8 }}>
              <Button label="Info" onClick={() => setOpen({ type: "info" })} />
              <Button
                label="Success"
                onClick={() => setOpen({ type: "success" })}
              />
              <Button
                label="Error"
                onClick={() => setOpen({ type: "error" })}
              />
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
            {
              prop: "isOpen",
              type: "boolean",
              description: "Controlled 열림 상태.",
            },
            {
              prop: "defaultOpen",
              type: "boolean",
              defaultValue: "false",
              description: "Uncontrolled 초기 상태.",
            },
            {
              prop: "onOpenChange",
              type: "(open: boolean) => void",
              description: "duration 만료/닫기 버튼 클릭 시 false로 호출.",
            },
            { prop: "message", type: "string", description: "표시할 메시지." },
            {
              prop: "type",
              type: `"info" | "success" | "error"`,
              defaultValue: `"info"`,
              description: "팝업 종류.",
            },
            {
              prop: "duration",
              type: "number",
              defaultValue: "3000",
              description:
                "자동으로 닫히기까지의 시간(ms). 0 이하면 자동 닫힘 비활성.",
            },
          ]}
        />
      </Section>
    </article>
  );
}
