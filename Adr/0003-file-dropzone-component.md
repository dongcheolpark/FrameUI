# ADR 0003: FileDropzone 컴포넌트 (File Dropzone Component)

## 1. 배경 및 문제 (Context & Problem)

파일 업로드는 대부분의 제품에서 빠지지 않는 핵심 인터랙션이지만, 플랫폼이 기본 제공하는 `<input type="file">`는 실제 제품 요구사항을 거의 만족하지 못합니다.

- **스타일링의 한계**: `<input type="file">` 자체는 브라우저마다 다르게 렌더링되며, CSS로 일관된 디자인을 입히는 것이 사실상 불가능합니다. 보통 `opacity: 0`으로 숨기고 커스텀 버튼을 덧씌우는 꼼수가 필요합니다.
- **다중 상태 부재**: 드래그 중(dragging), 검증 실패(invalid), 선택 완료 등 제품에 필요한 상태 피드백이 기본 요소에는 없습니다.
- **드래그 앤 드롭 미지원**: 네이티브 input은 클릭 업로드만 제공합니다. 드래그앤드롭은 개발자가 직접 `dragenter/over/leave/drop` 이벤트 체계를 구축해야 하며, `dragover`에서 `preventDefault()`를 빠뜨리면 드롭이 아예 동작하지 않는 실수가 자주 발생합니다.
- **검증/거부 처리 부재**: 파일 타입, 파일 크기, 개수 상한에 대한 일관된 거부 사유 전달 방식이 없습니다. `accept` 속성은 단순 힌트일 뿐 브라우저가 강제하지 않는 경우도 많습니다(특히 드래그 드롭 경로).
- **Paste(붙여넣기) 경로 부재**: 스크린샷이나 클립보드 이미지 업로드는 현대 웹 앱에서 점점 일반적인 동작이지만, 네이티브 input은 이 경로를 전혀 다루지 않습니다.

기존 생태계의 대안도 FrameUI의 포지셔닝과는 맞지 않습니다.

- **react-dropzone**: 가장 널리 쓰이는 솔루션이지만, 훅(`useDropzone`) 기반 API가 FrameUI의 점진적 컴포넌트 확장(ADR 0001 §3) 철학과 다른 레이어에 있습니다. 또한 내부 로직이 상태 플래그를 반환하는 방식에 가까워, Compound 구조로 분해해 재조립하기에는 불편합니다.
- **Filepond, Uppy 같은 고수준 라이브러리**: UI와 업로드(네트워크)·프리뷰·크롭까지 한 번에 묶어서 제공하므로, unstyled를 지향하는 FrameUI와 책임 범위가 겹치지 않습니다. 번들 크기 역시 Headless 라이브러리 기준으로는 과합니다.

즉, FrameUI 사용자가 "드래그앤드롭과 클릭 업로드가 같이 동작하고, 접근성과 키보드 지원이 내장된 상태 머신"을 필요로 할 때, 스타일과 업로드 전략까지 가져오지 않고도 뼈대만 공급하는 컴포넌트가 필요합니다.

## 2. 결정 (Decision)

FrameUI는 `FileDropzone`을 헤드리스 Compound 컴포넌트로 제공합니다. 기존 `Tabs`, `Switch`에서 확립된 관례를 그대로 따릅니다.

- **Compound 구조**: `Root / Trigger / Input / Zone / FileList / FileItem / Remove`로 분해합니다. 최상위 `Root`는 Context로 상태를 공급하고, 각 하위 컴포넌트는 자신의 접근성·데이터 속성을 책임집니다.
- **Controlled / Uncontrolled 이중 API**: `files` / `defaultFiles` / `onFilesChange` 네이밍을 사용해 다른 FrameUI 컴포넌트와 일관성을 지킵니다.
- **상태 표식은 `data-*` 속성**: `data-ui="file-dropzone"`, `data-state="idle" | "dragging" | "invalid"`, `data-disabled` 등 문자열 속성으로 노출합니다. 사용자는 CSS 선택자(`[data-state="dragging"]`)로 스타일을 지정합니다.
- **`Object.assign`으로 Compound 묶기**: `FileDropzone = Object.assign(FileDropzoneRoot, { Root, Trigger, Input, Zone, FileList, FileItem, Remove })` 패턴을 따릅니다.
- **Paste 지원 내장**: 스크린샷을 붙여넣는 시나리오를 지원하기 위해 `Zone`에 paste 이벤트 리스너를 연결하고, `DataTransferItemList`에서 `File`을 수집합니다.
- **업로드 네트워크 로직은 의도적으로 제외(Out of scope)**: XHR/Fetch, 진행률(progress), 재시도, 멀티파트 업로드 청크 관리는 FrameUI가 관여하지 않습니다. `onFilesChange`로 전달된 `File[]`을 받아 사용자가 자신의 데이터 레이어에서 처리합니다. 이 경계는 ADR 0001의 "스타일링 자유도·접근성을 타협하지 않되 나머지 책임은 사용자에게 돌려준다"는 방향과 일치합니다.

## 3. 모바일 UX 원칙 (Mobile UX Principles)

FileDropzone의 이름이 "Dropzone"이지만, 모바일에서는 "드롭"이 거의 발생하지 않습니다. 모바일 브라우저(iOS Safari, Android Chrome)는 파일 시스템 드래그앤드롭을 전혀 지원하지 않거나 매우 제한적이기 때문에, 모바일 경험은 **탭하여 네이티브 파일 피커를 여는 것**이 주 동작이 되어야 합니다. 이 전제 위에서 다음 원칙을 지킵니다.

- **탭 = 파일 피커 호출**: `Zone`은 모바일에서 커다란 "탭 가능한 영역"입니다. `role="button"` + `tabIndex=0`에 더해, 터치 이벤트(click으로 합성됨)에서 숨겨진 `<input type="file">`을 `.click()` 호출로 엽니다.
- **카메라 즉시 촬영 옵션**: `accept="image/*"`와 `capture="environment"`(후면 카메라) / `capture="user"`(전면 카메라)를 `Input`에 그대로 전달할 수 있게 열어둡니다. 이는 모바일에서 "사진 업로드" 시나리오의 기본 UX이고, 앱 경험과의 간극을 좁히는 중요한 레버입니다.
- **터치 타겟 최소 48×48 CSS 픽셀**: WCAG 2.5.5 및 모바일 플랫폼 가이드(HIG, Material)와 일치하도록 `Zone`의 기본 높이는 사용자 CSS에서 최소 48px 이상으로 지정되어야 한다는 것을 문서에 명시합니다. FrameUI는 unstyled이므로 값 자체를 강제하지는 않지만, 실제 hit area는 시각 테두리보다 크게 잡으라는 권고를 유지합니다.
- **대용량 파일 선택 시 UI 블로킹 방지**: 상태에는 `File` 객체 참조만 보관합니다. 썸네일/프리뷰 생성(`URL.createObjectURL`, `FileReader.readAsDataURL`)은 FileDropzone이 직접 수행하지 않고, 사용자가 `FileItem` 내부에서 lazy하게 처리하도록 둡니다. 1GB짜리 동영상을 선택했을 때 기본 컴포넌트만으로 메인 스레드가 멈추는 일이 없어야 합니다.
- **iOS Safari `<input capture>` 동작 차이**: iOS는 `capture` 속성의 동작 방식이 버전·기기별로 다릅니다(카메라를 바로 열기도 하고, 갤러리와 카메라 중 고르는 시트를 띄우기도 함). 이 차이는 FrameUI가 감추지 않습니다. 문서에서 "`capture`는 힌트"라는 점을 명확히 안내하고, 동작을 강제하기 위한 꼼수(예: 네이티브 API 스니핑)는 넣지 않습니다.
- **Paste는 모바일에서 희귀**: 모바일 소프트 키보드 환경에서 이미지 붙여넣기는 매우 드물지만, iPad + 외부 키보드 또는 일부 Android 키보드에서는 유효합니다. Paste 핸들러는 켜두되, 모바일의 주 경로로 홍보하지 않습니다.
- **시각적 드롭 영역과 실제 탭 타겟의 분리**: 디자인상 "드래그 영역"을 점선 테두리 박스로 표시하는 경우, 모바일에서는 그 박스 외부 여백까지 탭 가능하도록 `padding`/`::before` 확장으로 hit area를 키우는 패턴을 권장합니다. 시각적 크기와 탭 가능 크기가 반드시 같을 필요는 없습니다.
- **네트워크 상태 고려**: 모바일은 3G/저대역 구간이 흔합니다. FrameUI가 업로드 자체를 담당하지는 않지만, `onFilesChange`가 호출된 시점에 "선택되었음"만 상태로 남기고 실제 업로드 시작 시점은 사용자 코드가 제어하도록 설계했습니다. 덕분에 제품은 "Wi-Fi에서만 업로드" 같은 정책을 자유롭게 얹을 수 있습니다.

결과적으로 FileDropzone은 데스크톱에서는 "드래그해서 올리거나 클릭해서 선택", 모바일에서는 "탭해서 촬영하거나 갤러리에서 선택"이라는 두 경험을 같은 API 한 벌로 커버합니다.

## 4. 접근성 & 올바른 UI/UX (Accessibility & UX Correctness)

헤드리스 컴포넌트의 접근성은 "사용자가 스타일을 덮어써도 깨지지 않을 구조"를 의미합니다. FileDropzone이 고정적으로 보장하는 것들:

- **Zone은 버튼처럼 동작**: `role="button"`, `tabIndex=0`, Enter/Space에서 숨겨진 파일 input을 트리거합니다. 시각적 focus ring은 사용자 CSS 책임이지만, `:focus-visible` 기반으로 스타일할 수 있도록 내부 포커스 처리를 투명하게 둡니다.
- **드래그 시각 피드백은 `data-state`**: `data-state="dragging"`이 붙는 동안 사용자는 CSS로 배경·테두리를 바꿀 수 있습니다. 시각 피드백이 CSS에만 의존하면 안 되므로, `aria-live="polite"`로 "파일을 놓으면 업로드됩니다"와 같은 안내를 스크린리더에 전달할 수 있도록 `Root` 내부에 숨겨진 라이브 리전을 제공합니다.
- **거부된 파일 알림 위치**: 타입/크기/개수 위반 같은 거부는 `FileList` 옆이 아니라 `Zone` 하단 근처에 `role="alert"` 영역으로 고지하라고 권고합니다. 스크린리더는 alert를 즉시 읽어주므로, 사용자가 방금 왜 거부됐는지 문맥을 놓치지 않습니다. FrameUI는 이 안내 슬롯을 props로 강제하지 않지만, 예시에 표준 패턴을 포함합니다.
- **검증 규칙을 접근 가능 텍스트로**: "허용: PNG, JPG / 최대 5MB / 최대 3개"와 같은 규칙을 시각적 라벨뿐 아니라 `aria-describedby`로 `Zone`에 연결된 안내 텍스트에도 넣으라는 점을 예시로 보여줍니다. 스크린리더 사용자가 dialog를 열기 전에 규칙을 알 수 있어야 합니다.
- **`dragover` 기본 동작 차단**: DnD가 동작하지 않는 가장 흔한 원인은 `dragover` 핸들러에서 `e.preventDefault()`를 호출하지 않는 것입니다. FrameUI가 내부에서 항상 호출합니다. 사용자가 `onDragOver`로 별도 동작을 넣어도 기본 방지 로직은 살아 있어야 합니다.
- **disabled 상태**: `disabled`일 때는 `aria-disabled="true"`, `tabIndex=-1`, 모든 DnD/클릭/paste 경로가 no-op이 됩니다. `data-disabled`는 CSS 훅입니다.
- **`aria-label` / `aria-labelledby`**: `Zone`에 시각 라벨을 직접 두지 않는 디자인일 경우 `aria-label`을 강제 요구합니다(컴포넌트가 에러는 던지지 않지만 TypeScript 주석과 문서로 안내).
- **키보드 단축 키 동선**: `Zone`이 포커스된 상태에서 Enter/Space는 파일 다이얼로그를 열고, `FileItem` 위의 `Remove`는 Backspace/Delete 없이도 Enter로 제거를 트리거합니다. 별도 단축 키(예: `Escape`로 드래그 상태 리셋)는 향후 확장 후보로만 남겨두고, 기본 기능은 웹 표준 버튼 의미론에 충실하게 둡니다.
- **RTL/로케일 중립성**: 컴포넌트 내부에서 좌/우 방향성을 가진 로직(화살표 키 네비게이션 등)은 없습니다. 그래서 RTL 환경에서도 추가 처리 없이 동작합니다. 이는 `Tabs`의 orientation 처리와는 달리 목록 탐색이 일차 UX가 아니기 때문입니다.

## 5. API 설계 (API Design)

### 5.1. Root Props

| Prop             | Type                                                                                 | Default  | 설명                                                    |
| ---------------- | ------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------- |
| `files`          | `File[]`                                                                             | —        | Controlled 값. 지정 시 내부 상태를 쓰지 않습니다.       |
| `defaultFiles`   | `File[]`                                                                             | `[]`     | Uncontrolled 초기 값.                                   |
| `onFilesChange`  | `(files: File[]) => void`                                                            | —        | 선택/드롭/제거로 파일 목록이 바뀔 때 호출됩니다.        |
| `accept`         | `string`                                                                             | —        | 네이티브 `accept`와 동일한 MIME/확장자 문자열.          |
| `multiple`       | `boolean`                                                                            | `false`  | 여러 개 선택 허용 여부.                                 |
| `maxFiles`       | `number`                                                                             | —        | 총 파일 개수 상한. 초과분은 거부됩니다.                 |
| `maxSize`        | `number` (bytes)                                                                     | —        | 개별 파일 크기 상한.                                    |
| `disabled`       | `boolean`                                                                            | `false`  | 상호작용 비활성화. `aria-disabled`, `data-disabled` 부여. |
| `onReject`       | `(rejections: { file: File; reason: "type" \| "size" \| "count" }[]) => void`        | —        | 검증 실패로 걸러진 파일과 사유를 묶어 전달합니다.       |

### 5.2. Compound 책임

- **`FileDropzone.Root`**: Context 공급, 파일 상태 기계(idle/dragging/invalid) 관리, 검증 실행. 렌더 엘리먼트는 기본 `<div>`.
- **`FileDropzone.Trigger`**: 파일 피커를 여는 클릭 가능 요소. 기본 `<button type="button">`. 내부적으로 `Input.click()`을 호출합니다. `asChild`를 지원해 사용자 버튼에 병합 가능합니다.
- **`FileDropzone.Input`**: 숨겨진 `<input type="file">`. `accept`, `multiple`, `capture` 속성이 전달됩니다. 시각적으로는 off-screen 처리되지만 포커스 가능 상태로 남겨 보조기기가 직접 접근할 수도 있게 합니다.
- **`FileDropzone.Zone`**: 드롭 타겟. `role="button"`, `tabIndex=0`, 키보드/클릭/DnD/Paste 핸들러를 모두 소유합니다. `aria-label` 또는 `aria-labelledby`가 권장됩니다.
- **`FileDropzone.FileList`**: 현재 파일 목록을 렌더합니다. 기본 태그는 `<ul role="list">`. Context에서 파일 배열을 소비해 `FileItem`을 매핑합니다.
- **`FileDropzone.FileItem`**: 개별 파일 렌더 슬롯. `File` 객체를 render-prop 또는 context 훅(`useFileDropzoneItem`)으로 노출합니다. 사용자는 여기서 썸네일, 크기, 진행률 UI를 자유롭게 그립니다.
- **`FileDropzone.Remove`**: 특정 파일을 목록에서 제거하는 버튼. 기본 태그 `<button type="button">`. `onFilesChange`를 통해 제거 결과를 통지합니다.

### 5.3. 거부 사유 분리

`onReject`는 배열로 전달됩니다. 한 번의 드롭에서 타입도 틀리고 크기도 초과한 파일이 섞일 수 있기 때문입니다. 각 항목은 `{ file, reason }` 쌍이며, `reason`은 최초로 걸린 규칙 하나입니다(구현 단순성 우선). 다중 사유 리포팅이 필요하면 사용자가 별도 훅에서 재검증할 수 있도록 `File` 객체 원본을 함께 넘깁니다.

`reason`의 평가 순서는 다음과 같이 고정합니다.

1. `"count"`: 이미 보유한 파일 수 + 이번 드롭의 파일 수가 `maxFiles`를 넘으면, 초과분부터 이 사유로 거부.
2. `"type"`: `accept`에 매치되지 않는 파일은 이 사유로 거부.
3. `"size"`: `maxSize`를 초과하는 파일은 이 사유로 거부.

이 순서는 결정적입니다. 테스트와 시나리오 문서에서도 같은 순서를 전제로 설명합니다.

### 5.4. 상태 머신 요약

`Root`가 관리하는 상태는 `"idle" | "dragging" | "invalid"` 셋으로 단순화됩니다. `"invalid"`는 검증 실패 직후 짧게(약 800ms) 유지되었다가 `"idle"`로 되돌아갑니다. 이 전이는 사용자가 CSS transition으로 쉽게 잡을 수 있도록 명시적으로 `data-state` 속성에 반영됩니다. 내부적으로 timeout 핸들은 언마운트 시 클린업됩니다.

## 6. 사용 예시 (Usage Examples)

### 6.1. 기본 모드 — 최소 prop

```tsx
// 프리뷰, 제거 버튼, 오류 영역까지 FrameUI가 제공하는 Compound의
// 기본 마크업을 그대로 쓰고 CSS로만 스타일링합니다.
import { FileDropzone } from "frame-ui";

export default function BasicUploader() {
  return (
    <FileDropzone
      accept="image/png,image/jpeg"
      maxSize={5 * 1024 * 1024}
      multiple
      maxFiles={3}
      onFilesChange={(files) => console.log("selected:", files)}
      onReject={(rejections) => console.warn("rejected:", rejections)}
    >
      <FileDropzone.Zone aria-label="이미지를 드래그하거나 클릭해 업로드">
        여기에 파일을 드롭하거나 클릭하세요
      </FileDropzone.Zone>
      <FileDropzone.FileList />
    </FileDropzone>
  );
}
```

### 6.2. 확장 모드 — Compound 재조립

```tsx
// 썸네일, 삭제 버튼, 카메라 촬영 트리거까지 레이아웃을 직접 짭니다.
// FileDropzone은 상태 기계만 제공하고 마크업은 전적으로 사용자의 몫입니다.
import { FileDropzone } from "frame-ui";

export default function CustomUploader() {
  return (
    <FileDropzone
      accept="image/*"
      multiple
      maxSize={10 * 1024 * 1024}
      onFilesChange={(files) => uploadToServer(files)}
      onReject={(r) => toast.error(`${r.length}개의 파일이 거부되었습니다`)}
    >
      <div className="dz-header">
        <FileDropzone.Trigger asChild>
          <MyButton>갤러리에서 선택</MyButton>
        </FileDropzone.Trigger>
        {/* 모바일: 후면 카메라 즉시 촬영 */}
        <FileDropzone.Input capture="environment" />
      </div>

      <FileDropzone.Zone
        aria-label="사진 업로드 영역"
        aria-describedby="dz-rules"
        className="dz-zone"
      >
        <p>사진을 드래그하거나 탭해서 촬영하세요</p>
        <p id="dz-rules" className="dz-rules">
          JPG/PNG · 최대 10MB · 여러 장 가능
        </p>
      </FileDropzone.Zone>

      <FileDropzone.FileList className="dz-grid">
        {(file) => (
          <FileDropzone.FileItem key={file.name} file={file} className="dz-card">
            <Thumbnail file={file} />
            <span>{file.name}</span>
            <FileDropzone.Remove file={file} aria-label={`${file.name} 제거`}>
              ×
            </FileDropzone.Remove>
          </FileDropzone.FileItem>
        )}
      </FileDropzone.FileList>
    </FileDropzone>
  );
}
```

## 7. 대안 및 트레이드오프 (Alternatives Considered)

- **react-dropzone 래핑**: 공식 구현이 안정적이고 테스트도 잘 되어 있지만, 훅 기반이라 FrameUI의 Compound API 표면과 어긋납니다. 또한 재배포가 아닌 의존성 추가는 `agent.md`의 "외부 의존성 최소화" 원칙과 충돌합니다. 장기적으로는 FrameUI의 `data-state` 체계와 이벤트 네이밍을 통일할 수 없어 기각합니다.
- **단순 `<input type="file">` 스타일링**: `label` + `input:hidden`으로 버튼 느낌만 내는 방식입니다. 코드는 짧지만 드롭·페이스트·키보드·검증 피드백이 전혀 없어 제품 품질 기준을 충족하지 못합니다. Non-goal.
- **Filepond/Uppy 같은 고수준 라이브러리**: 업로드·프리뷰·크롭까지 한꺼번에 해결해주지만, 번들 크기와 스타일 결합도가 Headless 라이브러리 기준에 맞지 않습니다. "네트워크는 사용자 코드가 책임진다"는 우리 경계와 정면 충돌합니다.
- **훅만 노출하는 `useFileDropzone`**: Radix-스타일 컴파운드를 포기하고 훅으로 반환값을 넘기는 안입니다. 최소한의 마크업 강제도 없앨 수 있지만, ADR 0001 §3에서 정한 "훅이 아닌 점진적 컴포넌트 확장"과 어긋나므로 기각합니다. 필요하다면 내부적으로 `useFileDropzoneState`를 두고 Compound에서 소비하는 선에서 그칩니다.

## 8. 결과 (Consequences)

### 8.1. Positive

- FrameUI의 다른 컴포넌트(`Tabs`, `Switch`, `RadioCards`, `CheckboxCards`)와 일관된 Compound 구조·Controlled/Uncontrolled API·`data-*` 훅을 제공합니다. 학습 비용이 거의 없습니다.
- 데스크톱(드롭)과 모바일(탭→피커/카메라)을 하나의 마크업으로 커버합니다.
- 업로드 네트워크 로직을 포함하지 않기 때문에 번들이 작고, 진행률 UI·재시도·취소 같은 도메인 결정을 사용자 손에 남깁니다.

### 8.2. Negative

- 사용자가 직접 업로드 파이프라인(XHR/Fetch, 진행률, 실패 재시도, 멀티파트/청크)을 구현해야 합니다. 입문자에게는 추가 학습 부담이 될 수 있습니다. 문서에서 권장 레시피(React Query + `fetch`, 또는 XHR 기반 훅 예시)를 충분히 제공해 이 간극을 보완해야 합니다.
- 썸네일 생성도 사용자 책임입니다. 대용량 영상 미리보기 같은 시나리오에서는 `URL.createObjectURL` 호출·해제를 스스로 관리해야 합니다.
- 거부 사유는 최초 매치 하나만 돌려줍니다. 다중 사유가 필요한 제품은 별도 검증 레이어를 덧붙여야 합니다.

### 8.3. Ongoing

- 브라우저별 DnD 이벤트 편차(특히 Firefox의 `dragenter/leave` 중첩 발화, Safari의 `DataTransferItem` 처리)는 지속적으로 회귀 테스트로 잡습니다.
- iOS Safari의 `<input capture>` 동작은 OS 버전에 따라 변합니다. 릴리스마다 실제 기기 확인 결과를 체인지로그에 노출합니다.
- 모바일 DnD 스펙(예: Android Chrome의 실험적 DnD 지원)이 보편화되면 `Zone`의 모바일 전략을 재검토합니다. 이 ADR은 그 시점에 업데이트합니다.
- 업로드 레시피 문서는 라이브러리 코드와 별개로 유지·확장되어야 합니다. FrameUI 본체에는 네트워크 로직을 넣지 않는다는 경계를 계속 지킵니다.
