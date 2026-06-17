import { Button, Toast } from "FrameUI";
import { Install, PageHeader, Section } from "@/components/docs/PageLayout";
import { Example } from "@/components/docs/Example";
import { PropTable } from "@/components/docs/PropTable";

const basicCode = `import { Button, Toast } from "FrameUI";

function Root() {
  return (
    <Toast.Provider duration={4000} limit={3}>
      <App />
      <Toast.Viewport />
    </Toast.Provider>
  );
}

function App() {
  const { toast } = Toast.useToast();
  return (
    <Button
      label="Save"
      onClick={() =>
        toast.success({
          title: "저장됨",
          description: "프로필이 업데이트되었습니다.",
        })
      }
    />
  );
}`;

const typesCode = `// type="background" — role="status" + aria-live="polite" (기본)
toast({ title: "Saved" });
// 또는 toast.success(...)

// type="foreground" — role="alertdialog" + aria-live="assertive"
toast.error({ title: "연결이 끊어졌습니다" });`;

const actionCode = `toast.error({
  id: "offline",                              // 중복 호출 시 업데이트
  title: "연결이 끊어졌습니다",
  description: "네트워크를 확인해 주세요.",
  duration: Number.POSITIVE_INFINITY,         // 수동 닫기 전용
  action: (
    <Toast.Action altText="다시 시도" onClick={retry}>
      다시 시도
    </Toast.Action>
  ),
});`;

const compoundCode = `<Toast.Provider>
  <App />
  <Toast.Viewport>
    <Toast.Root open={isOpen} onOpenChange={setOpen} type="foreground">
      <Toast.Title>커스텀 레이아웃</Toast.Title>
      <Toast.Description>props 대신 children으로 직접 조립.</Toast.Description>
      <Toast.Action altText="OK">OK</Toast.Action>
      <Toast.Close />
    </Toast.Root>
  </Toast.Viewport>
</Toast.Provider>`;

const asChildCode = `<Toast.Action altText="다시 시도" asChild onClick={retry}>
  <MyButton variant="primary">다시 시도</MyButton>
</Toast.Action>

// FrameUI의 <button> 대신 사용자 MyButton에
// data-ui / aria-label / onClick(체이닝)이 머지됨.`;

export function ToastPage() {
  return (
    <Toast.Provider duration={4000} limit={3}>
      <article className="page">
        <PageHeader
          category="Overlays"
          title="Toast"
          description="Provider 기반 스택과 명령형 API로 일시 알림을 관리하는 비차단 알림. Prop / Compound / asChild 세 가지 점진적 확장 경로를 제공합니다."
        />

        <Install
          npm="npm install @frameui57/frame-ui"
          importStmt={`import { Toast } from "FrameUI";`}
        />

        <Section id="overview" title="Overview">
          <p>
            Toast는 사용자의 현재 작업을 막지 않고 화면 모서리에 잠깐 떠올랐다가
            사라지는 비차단 알림 시스템입니다. "저장됨", "결제 완료", "복사됨"
            같은 작업 결과나 "연결이 끊어졌습니다", "새 메시지" 같은 시스템
            상태를 사용자가 보던 화면 흐름을 끊지 않으면서 알려줄 때 사용됩니다.
            여러 알림이 동시에 생겨도 한 곳에 차곡차곡 쌓이고, 일정 시간이
            지나면 스스로 닫히며, "다시 시도" 같은 액션 버튼을 함께 띄워
            사용자가 즉시 후속 행동을 할 수 있게 만들 수도 있습니다.
            성공/완료처럼 굳이 시선을 강하게 끌 필요 없는 알림(background)부터
            사용자의 응답이 꼭 필요한 알림(foreground)까지 두 가지 톤을
            제공합니다.
          </p>
        </Section>

        <Section id="basic-example" title="Basic example">
          <Example preview={<BasicDemo />} code={basicCode} />
        </Section>

        <Section id="types" title="Types (background vs foreground)">
          <p>
            <code>type="background"</code>(기본)은 <code>role="status"</code> +{" "}
            <code>aria-live="polite"</code>로 비차단 알림을,{" "}
            <code>type="foreground"</code>는 <code>role="alertdialog"</code> +{" "}
            <code>aria-live="assertive"</code>로 사용자 응답이 필요한 차단성
            알림을 표현합니다.
          </p>
          <Example preview={<TypesDemo />} code={typesCode} />
        </Section>

        <Section id="action" title="Action + 영구 표시 + duplicate collapse">
          <p>
            <code>action</code>에 <code>&lt;Toast.Action&gt;</code>을 전달하고{" "}
            <code>duration={"{Infinity}"}</code>로 두면 수동으로 닫기 전까지
            유지됩니다. 같은 <code>id</code>로 다시 호출하면 새 토스트를
            추가하지 않고 기존 항목을 업데이트합니다.
          </p>
          <Example preview={<ActionDemo />} code={actionCode} />
        </Section>

        <Section id="compound" title="Compound 모드 (커스텀 레이아웃)">
          <p>
            <code>title</code> / <code>description</code> / <code>action</code>{" "}
            prop 없이 <code>children</code>에 서브컴포넌트를 직접 조립하면 Prop
            모드 자동 마크업이 비활성화되고 사용자가 완전히 통제합니다.
          </p>
          <Example preview={<CompoundDemo />} code={compoundCode} />
        </Section>

        <Section id="aschild" title="asChild (Slot 패턴)">
          <p>
            <code>Toast.Root</code> / <code>Toast.Action</code> /{" "}
            <code>Toast.Close</code>에 <code>asChild</code>를 주면 FrameUI 기본
            요소 대신 사용자 컴포넌트에 ARIA / 이벤트 / data-* 가 머지됩니다.
            이벤트 핸들러는 자식 → slot 순서로 체이닝되고, 자식이{" "}
            <code>e.preventDefault()</code>를 호출하면 slot 핸들러는 건너뜁니다.
          </p>
          <Example preview={<AsChildDemo />} code={asChildCode} />
        </Section>

        <Section id="api-provider" title="Toast.Provider Props">
          <PropTable
            rows={[
              {
                prop: "duration",
                type: "number",
                defaultValue: "5000",
                description:
                  "Root가 별도 지정하지 않을 때 사용되는 기본 자동 닫힘 시간(ms). Infinity 허용.",
              },
              {
                prop: "limit",
                type: "number",
                defaultValue: "3",
                description: "동시에 보이는 최대 토스트 개수.",
              },
              {
                prop: "label",
                type: "string",
                defaultValue: `"Notifications"`,
                description: "Viewport aria-label.",
              },
            ]}
          />
        </Section>

        <Section id="api-root" title="Toast.Root Props">
          <PropTable
            rows={[
              {
                prop: "open",
                type: "boolean",
                description: "Controlled 오픈 상태.",
              },
              {
                prop: "defaultOpen",
                type: "boolean",
                defaultValue: "true",
                description: "Uncontrolled 초기 상태.",
              },
              {
                prop: "onOpenChange",
                type: "(open: boolean) => void",
                description: "duration 만료 / 사용자 dismiss 시 false로 호출.",
              },
              {
                prop: "type",
                type: `"background" | "foreground"`,
                defaultValue: `"background"`,
                description: "ARIA 역할과 live region 강도 결정.",
              },
              {
                prop: "priority",
                type: `"high" | "low"`,
                defaultValue: `"low"`,
                description: "스택 정렬. high가 상단/전면.",
              },
              {
                prop: "duration",
                type: "number",
                description:
                  "이 토스트만의 자동 닫힘 시간(ms). 미지정 시 Provider 상속.",
              },
              {
                prop: "title",
                type: "ReactNode",
                description: "Prop 모드 — 정의되면 Toast.Title 자동 조립.",
              },
              {
                prop: "description",
                type: "ReactNode",
                description:
                  "Prop 모드 — 정의되면 Toast.Description 자동 조립.",
              },
              {
                prop: "action",
                type: "ReactNode",
                description: "Prop 모드 — Toast.Action 등을 그대로 렌더.",
              },
              {
                prop: "hideClose",
                type: "boolean",
                defaultValue: "false",
                description: "Prop 모드의 자동 Close 버튼을 끕니다.",
              },
              {
                prop: "asChild",
                type: "boolean",
                defaultValue: "false",
                description:
                  "true면 자식 엘리먼트에 data-* / ARIA / 이벤트를 머지.",
              },
            ]}
          />
        </Section>

        <Section id="api-hook" title="useToast() 반환값">
          <PropTable
            rows={[
              {
                prop: "toast(options)",
                type: "(input: ToastOptions | ReactNode) => string",
                description:
                  "새 토스트를 큐에 추가하고 id를 반환. 동일 id 재호출 시 업데이트.",
              },
              {
                prop: "toast.success(options)",
                type: "(input: ToastOptions | ReactNode) => string",
                description: "type='background'로 추가하는 단축.",
              },
              {
                prop: "toast.error(options)",
                type: "(input: ToastOptions | ReactNode) => string",
                description: "type='foreground'로 추가하는 단축.",
              },
              {
                prop: "dismiss(id?)",
                type: "(id?: string) => void",
                description:
                  "id 지정 시 해당 토스트만, 미지정 시 모든 토스트 제거.",
              },
              {
                prop: "update(id, options)",
                type: "(id: string, opts: ToastOptions) => void",
                description: "기존 토스트를 in-place 업데이트.",
              },
            ]}
          />
        </Section>
      </article>

      <Toast.Viewport />
    </Toast.Provider>
  );
}

function BasicDemo() {
  const { toast } = Toast.useToast();
  return (
    <Button
      label="Save"
      onClick={() =>
        toast.success({
          title: "저장됨",
          description: "프로필이 업데이트되었습니다.",
        })
      }
    />
  );
}

function TypesDemo() {
  const { toast } = Toast.useToast();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button
        label="background"
        onClick={() => toast({ title: "Background 알림" })}
      />
      <Button
        label="foreground"
        onClick={() => toast.error({ title: "Foreground 알림" })}
      />
    </div>
  );
}

function ActionDemo() {
  const { toast } = Toast.useToast();
  return (
    <Button
      label="오프라인 시뮬레이션"
      onClick={() =>
        toast.error({
          id: "offline",
          title: "연결이 끊어졌습니다",
          description: "네트워크를 확인해 주세요.",
          duration: Number.POSITIVE_INFINITY,
          action: (
            <Toast.Action
              altText="다시 시도"
              onClick={() => console.log("retry")}
            >
              다시 시도
            </Toast.Action>
          ),
        })
      }
    />
  );
}

function CompoundDemo() {
  const { toast } = Toast.useToast();
  return (
    <Button
      label="Compound 토스트"
      onClick={() =>
        toast({
          action: (
            <>
              <Toast.Title>커스텀 레이아웃</Toast.Title>
              <Toast.Description>
                props 대신 action 슬롯에 직접 조립한 예시.
              </Toast.Description>
              <Toast.Action altText="OK">OK</Toast.Action>
            </>
          ),
        })
      }
    />
  );
}

function AsChildDemo() {
  const { toast } = Toast.useToast();
  return (
    <Button
      label="asChild 액션"
      onClick={() =>
        toast.error({
          title: "asChild 데모",
          description:
            "Action이 <a> 태그로 렌더되지만 ARIA / 이벤트는 그대로 머지됩니다.",
          duration: Number.POSITIVE_INFINITY,
          action: (
            <Toast.Action altText="자세히 보기" asChild>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("link clicked");
                }}
              >
                자세히 보기
              </a>
            </Toast.Action>
          ),
        })
      }
    />
  );
}
