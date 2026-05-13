import { FileDropzone } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { FileDropzone } from "FrameUI";

export function Demo() {
  return (
    <FileDropzone accept="image/*" multiple maxFiles={5} maxSize={5 * 1024 * 1024}>
      <FileDropzone.Zone>
        <span>Drop files here</span>
        <span>or click to browse</span>
      </FileDropzone.Zone>
      <FileDropzone.Input />
      <FileDropzone.FileList>
        {(file) => (
          <FileDropzone.FileItem file={file}>
            {file.name}
            <FileDropzone.Remove file={file}>×</FileDropzone.Remove>
          </FileDropzone.FileItem>
        )}
      </FileDropzone.FileList>
    </FileDropzone>
  );
}`;

const triggerCode = `<FileDropzone>
  <FileDropzone.Trigger>Choose file</FileDropzone.Trigger>
  <FileDropzone.Input />
</FileDropzone>`;

const rejectCode = `<FileDropzone
  accept="image/png,image/jpeg"
  maxSize={1 * 1024 * 1024}
  onReject={(rejections) => {
    rejections.forEach((r) => console.warn(r.reason, r.file.name));
  }}
>
  ...
</FileDropzone>`;

export function FileDropzonePage() {
  return (
    <article className="page">
      <PageHeader
        category="Forms"
        title="FileDropzone"
        description="드래그 앤 드롭, 클릭, 클립보드 붙여넣기로 파일을 받는 컴포넌트. accept, multiple, maxFiles, maxSize 검증과 onReject 콜백을 지원합니다."
      />

      <Install npm="npm install FrameUI" importStmt={`import { FileDropzone } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <p>
          <code>FileDropzone.Zone</code>이 클릭, 드롭, paste 이벤트를 모두 처리합니다.
          <code>FileDropzone.Input</code>은 시각적으로 숨겨진 file input이며 반드시 트리에 포함시켜야 합니다.
        </p>
        <Example
          preview={
            <FileDropzone accept="image/*" multiple maxFiles={5} className="demo-dropzone">
              <FileDropzone.Zone className="demo-dropzone-zone">
                <strong>Drop files here</strong>
                <span style={{ color: "var(--docs-muted)", fontSize: 13 }}>or click to browse</span>
              </FileDropzone.Zone>
              <FileDropzone.Input />
              <FileDropzone.FileList className="demo-dropzone-list">
                {(file) => (
                  <FileDropzone.FileItem file={file} className="demo-dropzone-item">
                    <span>{file.name}</span>
                    <FileDropzone.Remove file={file} className="demo-dropzone-remove">×</FileDropzone.Remove>
                  </FileDropzone.FileItem>
                )}
              </FileDropzone.FileList>
            </FileDropzone>
          }
          code={basicCode}
        />
      </Section>

      <Section id="trigger" title="Custom trigger">
        <p>Zone 대신 버튼만 사용하고 싶다면 <code>FileDropzone.Trigger</code>를 쓸 수 있습니다.</p>
        <Example
          preview={
            <FileDropzone>
              <FileDropzone.Trigger className="demo-dropzone-trigger-btn">Choose file</FileDropzone.Trigger>
              <FileDropzone.Input />
            </FileDropzone>
          }
          code={triggerCode}
        />
      </Section>

      <Section id="rejections" title="Rejections">
        <p>
          타입/사이즈/개수 제한을 통과하지 못한 파일은 <code>onReject</code>로 전달됩니다.
          짧게 <code>data-state="invalid"</code>가 표시되어 사용자에게 시각 피드백을 줄 수 있습니다.
        </p>
        <Example preview={<span style={{ color: "var(--docs-muted)" }}>코드 참조</span>} code={rejectCode} />
      </Section>

      <Section id="api" title="Component API">
        <h3>FileDropzone (= Root)</h3>
        <PropTable
          rows={[
            { prop: "files / defaultFiles", type: "File[]", description: "Controlled / uncontrolled 파일 목록." },
            { prop: "onFilesChange", type: "(files: File[]) => void", description: "파일 목록이 바뀔 때 호출." },
            { prop: "accept", type: "string", description: `MIME 또는 확장자 (예: "image/*,.pdf").` },
            { prop: "multiple", type: "boolean", defaultValue: "false", description: "다중 선택 허용." },
            { prop: "maxFiles", type: "number", description: "총 파일 개수 제한." },
            { prop: "maxSize", type: "number", description: "개별 파일 최대 바이트." },
            { prop: "onReject", type: "(rejections: FileDropzoneRejection[]) => void", description: `거부된 파일 목록과 사유("type"|"size"|"count").` },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "전체 비활성화." },
          ]}
        />
        <h3>Sub-components</h3>
        <PropTable
          rows={[
            { prop: "Zone", type: "div", description: "드롭/클릭/paste를 받는 영역." },
            { prop: "Trigger", type: "button", description: "클릭 시 파일 선택창을 엽니다." },
            { prop: "Input", type: "input", description: "숨겨진 file input. 항상 트리 안에 있어야 합니다." },
            { prop: "FileList", type: "ul", description: "선택된 파일 목록을 렌더. children에 (file) => ReactNode 함수를 줄 수 있습니다." },
            { prop: "FileItem", type: "li", description: "개별 파일 항목. file prop 필수." },
            { prop: "Remove", type: "button", description: "해당 파일을 제거합니다. file prop 필수." },
          ]}
        />
      </Section>
    </article>
  );
}
