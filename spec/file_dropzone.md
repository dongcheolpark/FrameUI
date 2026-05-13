# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: File Dropzone
- 한 줄 설명: 드래그앤드롭, 클릭 업로드, 붙여넣기를 통합한 접근성 기반 파일 수집 Compound 컴포넌트 (업로드 네트워크 로직은 포함하지 않음)

## 2. 해결할 문제

- 네이티브 `<input type="file">`는 브라우저마다 렌더링이 달라 일관된 스타일링이 사실상 불가능하다.
- 드래그 중(dragging), 검증 실패(invalid) 같은 제품 요구 상태를 기본 요소는 노출하지 않는다.
- 드래그앤드롭은 `dragenter/over/leave/drop` 체계를 직접 구현해야 하고, `dragover`에서 `preventDefault()`를 빠뜨리면 드롭이 아예 동작하지 않는 실수가 잦다.
- 파일 타입/크기/개수에 대한 일관된 거부 사유 전달 방식이 없고, `accept`는 드롭 경로에서 강제되지 않는다.
- 스크린샷 붙여넣기(paste) 같은 현대적 업로드 경로를 네이티브 요소만으로는 다룰 수 없다.

## 3. 구조 및 API 명세표 (Compound Components)

### `FileDropzone.Root`

- Context 공급과 상태 머신(`idle` / `dragging` / `invalid`) 관리, 검증 실행을 담당합니다.
- 렌더 기본 태그: `<div>`. `data-ui="file-dropzone"`, `data-state`, `data-disabled`가 자동 부여됩니다.

| Prop            | Type                                                                          | Default | 설명                                                                      |
| --------------- | ----------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| `files`         | `File[]`                                                                      | —       | Controlled 값. 지정 시 내부 상태를 사용하지 않습니다.                     |
| `defaultFiles`  | `File[]`                                                                      | `[]`    | Uncontrolled 초기 값.                                                     |
| `onFilesChange` | `(files: File[]) => void`                                                     | —       | 선택/드롭/제거 등으로 파일 목록이 바뀔 때 호출됩니다.                     |
| `accept`        | `string`                                                                      | —       | 네이티브 `accept`와 동일한 MIME/확장자 문자열. 검증과 Input에 모두 적용. |
| `multiple`      | `boolean`                                                                     | `false` | 여러 개 선택 허용 여부.                                                   |
| `maxFiles`      | `number`                                                                      | —       | 총 파일 개수 상한. 초과분은 거부됩니다.                                   |
| `maxSize`       | `number` (bytes)                                                              | —       | 개별 파일 크기 상한.                                                      |
| `disabled`      | `boolean`                                                                     | `false` | 상호작용 비활성화. `aria-disabled`, `data-disabled` 부여.                 |
| `onReject`      | `(rejections: { file: File; reason: "type" \| "size" \| "count" }[]) => void` | —       | 검증 실패로 걸러진 파일과 사유를 묶어 전달합니다.                         |

### `FileDropzone.Trigger`

- 숨겨진 `Input`의 파일 피커를 여는 클릭 가능 요소. 내부적으로 `Input.click()`을 호출합니다.
- 렌더 기본 태그: `<button type="button">`. `asChild`를 지원해 사용자 버튼에 병합 가능합니다.
- `disabled`일 때는 클릭 no-op.

### `FileDropzone.Input`

- 숨겨진 `<input type="file">`. 오프스크린으로 배치하되 포커스 가능 상태로 남겨 보조기기가 직접 접근할 수 있게 합니다.
- `accept`, `multiple`은 `Root`에서 내려받아 자동 적용되며, `capture` prop을 전달해 모바일 카메라 힌트("environment"/"user")를 줄 수 있습니다.
- 렌더 기본 태그: `<input>`. `asChild` 미지원.

### `FileDropzone.Zone`

- 드롭 타겟이자 주 상호작용 영역. 클릭/키보드/DnD/Paste 핸들러를 모두 소유합니다.
- 렌더 기본 태그: `<div>` + `role="button"`, `tabIndex=0`. `data-ui="file-dropzone-zone"`, `data-state`가 자동 부여됩니다.
- `aria-label` 또는 `aria-labelledby`가 권장되며, 규칙 안내는 `aria-describedby`로 연결하는 것을 권장합니다.
- `asChild` 지원.

### `FileDropzone.FileList`

- 현재 파일 목록을 렌더합니다. Context에서 파일 배열을 소비해 `FileItem`을 매핑합니다.
- 렌더 기본 태그: `<ul role="list">`. `data-ui="file-dropzone-list"`가 자동 부여됩니다.
- 자식으로 render-prop `(file: File) => ReactNode`를 받거나, 정적 children을 받습니다.

### `FileDropzone.FileItem`

- 개별 파일 렌더 슬롯. `File` 객체를 render-prop 또는 context 훅(`useFileDropzoneItem`)으로 노출합니다.
- 렌더 기본 태그: `<li>`. `data-ui="file-dropzone-item"`가 자동 부여됩니다.
- 썸네일, 크기 표시, 진행률 UI는 이 안에서 사용자가 자유롭게 구성합니다.
- `asChild` 지원.

### `FileDropzone.Remove`

- 특정 파일을 목록에서 제거하는 버튼. `onFilesChange`를 통해 제거 결과를 통지합니다.
- 렌더 기본 태그: `<button type="button">`. `data-ui="file-dropzone-remove"`가 자동 부여됩니다.
- `file` prop으로 대상 파일을 지정하거나, `FileItem` 컨텍스트 안에서 자동 참조합니다.
- `asChild` 지원.

## 4. 핵심 동작 명세

1. **상태 머신 (`idle` / `dragging` / `invalid`)**
   - `Root`가 셋 중 하나의 상태를 유지하며 `data-state`로 노출합니다.
   - `dragging`은 `dragenter` 시 진입하고 `dragleave`/`drop` 시 해제합니다.
   - `invalid`는 검증 실패 직후 약 800ms 유지되었다가 자동으로 `idle`로 복귀합니다. 내부 timeout 핸들은 언마운트 시 클린업됩니다.

2. **입력 경로 3종**
   - **클릭/키보드**: `Zone`의 클릭 또는 Enter/Space 입력 → 숨겨진 `Input.click()` 호출로 네이티브 파일 피커 오픈.
   - **드래그앤드롭**: `Zone`이 `dragenter`/`dragover`/`dragleave`/`drop`을 소유하고, `dragover`에서 항상 `e.preventDefault()`를 호출합니다(사용자가 `onDragOver`를 덮어써도 기본 방지 로직은 유지).
   - **Paste**: `Zone`이 포커스된 상태에서 `paste` 이벤트의 `DataTransferItemList`를 순회해 `File`을 수집합니다.

3. **검증 평가 순서 (결정적)**
   - 평가 순서는 `count` → `type` → `size`로 고정합니다.
   - 각 파일은 최초 매치 한 건만 `reason`으로 분류되어 `onReject`에 전달됩니다.
   - 한 번의 드롭/선택에서 여러 파일이 각각 다른 사유로 거부될 수 있으므로 `onReject`는 항상 배열입니다.

4. **Disabled 동작**
   - `aria-disabled="true"`, `tabIndex=-1`을 부여합니다.
   - 클릭, 키보드 트리거, DnD, paste 등 모든 입력 경로가 no-op이 됩니다.
   - CSS 훅으로 `data-disabled`를 노출합니다.

5. **접근성 훅**
   - `Root` 내부에 `aria-live="polite"` 안내 슬롯을 제공해 드래그 진입/이탈 같은 시각 상태 변화를 스크린리더에 전달할 수 있게 합니다.
   - 거부 알림은 `FileList`가 아닌 `Zone` 하단 근처에 `role="alert"` 영역으로 두는 것을 권장합니다(문서/예시 수준 권고).
   - 검증 규칙 텍스트는 `aria-describedby`로 `Zone`에 연결해 다이얼로그 진입 전에 스크린리더가 읽도록 유도합니다.

6. **업로드는 Scope 바깥**
   - 컴포넌트는 `File` 참조 배열만 상태로 보관하고 `onFilesChange`로 전달합니다.
   - XHR/Fetch, 진행률, 재시도, 멀티파트 청크, 취소 등의 네트워크 로직은 사용자 코드의 책임입니다.
   - 썸네일/프리뷰(`URL.createObjectURL`, `FileReader`)도 사용자가 `FileItem` 내부에서 lazy하게 처리합니다.

## 5. 모바일 UX 원칙 (요약)

- 모바일 브라우저는 파일 시스템 DnD를 지원하지 않거나 매우 제한적이므로, 주 경로는 **탭하여 네이티브 파일 피커 호출**입니다.
- `accept="image/*"` + `capture="environment"`(후면) / `capture="user"`(전면)을 `Input`에 전달해 카메라 즉시 촬영을 지원합니다. 단, `capture`는 OS/브라우저에 따라 동작이 다른 **힌트** 수준이며 FrameUI는 이를 감추지 않습니다.
- `Zone`의 터치 타겟은 최소 48×48 CSS px을 권장합니다. 시각적 테두리보다 실제 hit area(padding/`::before` 확장)를 넉넉히 잡도록 권장합니다.
- 대용량 파일 블로킹 방지를 위해 컴포넌트는 `File` 참조만 보관하며, 썸네일/읽기는 사용자가 lazy 처리합니다. 1GB 동영상을 선택해도 메인 스레드가 멈추지 않아야 합니다.
- Paste 핸들러는 모바일에서도 켜두지만, 희귀한 경로이므로 주 UX로 홍보하지 않습니다.
