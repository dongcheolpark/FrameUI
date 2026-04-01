# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: Textarea
- 한 줄 설명: 일반 폼 입력부터 채팅 입력창까지 대응하는 다목적 텍스트 입력 컴포넌트

## 2. 유연성 요구사항

- 단순 `textarea` 요소는 채팅방과 같은 곳에서 자동 높이 확장 기능이나 제출 이벤트를 유연하게 제어하기 불가능합니다.
- `maxLength` 및 글자 수 검증 코드가 매번 중복 구현되는 문제를 막아야 합니다.
- (특히 한국어/일본어) IME 조합 중 Enter 입력 시 발생하는 오동작(메시지 두 번 발송, 도중 제출)을 컴포넌트 레벨에서 차단해야 합니다.
- 확장성을 위해 전송 버튼 등을 붙일 수 있는 UI 계층을 Compound Component Pattern을 통해 제공해야 합니다.

## 3. 핵심 구현 기능

1. 입력 상태 관리
   - Native Form의 `onChange` 이벤트와 값(value)만 바로 반환하는 `onValueChange` 양쪽을 모두 지원합니다.
   - `value`, `defaultValue` 제공 (controlled/uncontrolled 모두 지원)
   - `disabled`, `readOnly` 지원
   - **React 19 호환 방식:** `ref`를 props로 직접 명시하여 Headless 제어를 완벽하게 지원합니다.

2. 자동 높이 확장(auto-resize)
   - 입력 내용에 따라 줄 단위로 높이가 증가합니다.
   - `minRows`, `maxRows` 옵션을 통해 범위 도달을 제어합니다.
   - `maxRows` 도달 시 `data-overflow`를 활성화하고 내부 스크롤 방식으로 제한합니다.

3. Enter 동작 제어 및 폼 연동
   - `enterKeyBehavior` 옵션 (`"newline"` | `"submit"`, 기본값은 `"newline"`)
   - **Submit 모드 명세:**
     - `enterKeyBehavior="submit"`일 때 Enter를 치면 단축 제출 이벤트를 실행합니다 (`onSubmitEnter` 콜백 호출).
     - 주의: Native `<form>` 요소의 `submit` 이벤트를 임의로 발생시키지 않으며 오로지 독자적인 콜백만 제공합니다.
     - `Shift+Enter` 입력은 `submit` 모드에서도 항상 강제로 줄바꿈 처리합니다.
     - `isComposing`(IME 조합 중)이 활성화된 상태에서의 Enter는 모든 제출 동작 체인에서 차단합니다.

4. 제어 및 메타 정보
   - `invalid` 상태 트리거 및 노출
   - `maxLength` 초과는 브라우저 기본 방어 체계에 맞기며 그 이상의 특이 동작(글자 자르기 등)은 하지 않습니다.

5. 컴파운드 계층 구조 (이번 업데이트 사항)
   - 래퍼와 전송 슬롯 등을 쉽게 스타일링하기 위해 완전한 Compound Component 기능을 제공합니다.
   - 기본 활용: `<Textarea />` (기존과 동일하게 단일 요소 반환)
   - 구조적 활용: 
     - `<Textarea.Root>` : 전체 래퍼
     - `<Textarea.Input>` : 실제 입력 텍스트 요소
     - `<Textarea.Action>` : 전송 버튼 부착용 슬롯

## 4. 모바일 및 제품 가이드라인 (단순 참고)

- 모바일 환경에서 물리 키보드 없는 단계를 고려해, `submit` 동작을 제공할 경우 필히 "전송 버튼" UI를 제공할 것을 권장합니다 (이 때 `<Textarea.Action>` 활용).
- 키보드 표시 힌트를 위해 필요시 `<Textarea enterKeyHint="send" />` 등을 전달하면 모바일 키보드의 엔터키 모양이 이에 맞추어 변경됩니다.
