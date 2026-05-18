import { useState } from "react";
import { Button, Modal } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { useState } from "react";
import { Button, Modal } from "FrameUI";

export function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Open modal" onClick={() => setOpen(true)} />
      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        title="Confirm"
        description="Are you sure?"
        footerSlot={
          <>
            <Button label="Cancel" onClick={() => setOpen(false)} />
            <Button label="Confirm" onClick={() => setOpen(false)} />
          </>
        }
      >
        <p>Body content here.</p>
      </Modal>
    </>
  );
}`;

const uncontrolledCode = `<Modal defaultOpen title="Hello"><p>...</p></Modal>`;

export function ModalPage() {
  const [open, setOpen] = useState(false);
  return (
    <article className="page">
      <PageHeader
        category="Overlays"
        title="Modal"
        description="중앙에 띄우는 다이얼로그. title, description, footerSlot으로 헤더/본문/푸터를 채우거나 children 영역에 임의 컨텐츠를 넣을 수 있습니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Modal } from "FrameUI";`} />

      <Section id="overview" title="Overview">
        <p>
          Modal은 현재 페이지 위에 떠올라 사용자의 주의를 한곳에 모으고, 결정이나 입력을 받아내야 끝나는 차단성 다이얼로그입니다.
          "정말 삭제하시겠어요?" 같은 확인 창, 로그인/회원가입 폼, 짧은 설문, 상세 보기, 결제 확인처럼
          뒤쪽 컨텐츠는 잠시 멈춰두고 사용자가 한 가지 흐름에 집중해야 하는 자리에 사용됩니다.
          오버레이 클릭이나 닫기 버튼으로 빠져나갈 수 있어 사용자의 작업 흐름을 다시 원래 위치로 매끄럽게 되돌릴 수 있습니다.
        </p>
      </Section>

      <Section id="basic-example" title="Basic example">
        <p>
          오버레이 클릭이나 닫기 버튼을 누르면 <code>onOpenChange(false)</code>가 호출됩니다.
          <code>title</code>, <code>description</code>은 옵션이며 <code>footerSlot</code>에 액션 버튼들을 넣어주세요.
        </p>
        <Example
          preview={
            <>
              <Button label="Open modal" onClick={() => setOpen(true)} />
              <Modal
                isOpen={open}
                onOpenChange={setOpen}
                title="Confirm"
                description="Are you sure?"
                footerSlot={
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Button label="Cancel" onClick={() => setOpen(false)} />
                    <Button label="Confirm" onClick={() => setOpen(false)} />
                  </div>
                }
              >
                <p>Body content here.</p>
              </Modal>
            </>
          }
          code={basicCode}
        />
      </Section>

      <Section id="uncontrolled" title="Uncontrolled">
        <p><code>defaultOpen</code>을 주면 내부 상태로 동작합니다.</p>
        <Example preview={<span style={{ color: "var(--docs-muted)" }}>코드만 참고</span>} code={uncontrolledCode} />
      </Section>

      <Section id="api" title="Component API">
        <PropTable
          rows={[
            { prop: "isOpen", type: "boolean", description: "Controlled 열림 상태." },
            { prop: "defaultOpen", type: "boolean", defaultValue: "false", description: "Uncontrolled 초기 상태." },
            { prop: "onOpenChange", type: "(open: boolean) => void", description: "닫힘 요청 시 호출. 오버레이 클릭, 닫기 버튼 클릭에서 false로 호출됩니다." },
            { prop: "title", type: "string", description: "헤더에 렌더되는 제목." },
            { prop: "description", type: "string", description: "본문 상단에 렌더되는 부가 설명." },
            { prop: "footerSlot", type: "ReactNode", description: "푸터 영역에 렌더할 노드 (보통 액션 버튼)." },
            { prop: "children", type: "ReactNode", description: "본문에 렌더할 임의 컨텐츠." },
          ]}
        />
      </Section>

      <Section id="styles" title="Required styles">
        <p>
          Modal은 <code>.modal-overlay</code>, <code>.modal-content</code>, <code>.modal-header</code>, <code>.modal-body</code>, <code>.modal-footer</code>, <code>.close-button</code> 클래스를 사용합니다.
          헤드리스 라이브러리이므로 자체 CSS를 직접 정의해야 합니다.
        </p>
      </Section>
    </article>
  );
}
