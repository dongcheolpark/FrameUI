# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: Textarea
- 한 줄 설명: 일반 폼 입력부터 채팅 입력창까지 대응하는 다목적 텍스트 입력 컴포넌트

## 2. 해결할 문제

- 단순 `textarea`는 채팅 입력창처럼 자동 높이 확장(auto-resize)이나 Enter 동작 제어가 부족하다.
- 제품마다 Enter 동작이 다르다: 어떤 화면은 줄바꿈, 어떤 화면은 전송(Submit)이어야 한다.
- `maxLength`, 현재 글자 수, 유효성 오류 같은 입력 보조 정보가 반복 구현된다.
- IME(한글/일본어) 조합 중 Enter 처리 오류가 자주 발생해 메시지 오발송 이슈가 생길 수 있다.

## 3. 필요한 필수 기능

1. 입력 상태 관리
   - `value`, `defaultValue`, `onValueChange` 제공 (controlled/uncontrolled 모두 지원)
   - `disabled`, `readOnly` 지원

2. 자동 높이 확장(auto-resize)
   - 입력 내용에 따라 높이가 자동 증가해야 한다.
   - `minRows`, `maxRows` 옵션 제공 (예: 채팅은 min 1, max 6)
   - `maxRows` 도달 이후에는 내부 스크롤로 전환

3. Enter 동작 제어 (채팅 시나리오 핵심)
   - `enterKeyBehavior` 옵션 제공
   - 값: `"newline" | "submit"`
   - `submit` 모드에서는 Enter 입력 시 `onSubmitEnter` 콜백 호출
   - `Shift+Enter`는 항상 줄바꿈 허용
   - IME 조합 중 Enter(`isComposing`)는 submit 동작을 발생시키면 안 됨
   - 모바일 환경에서 기본 동작은 줄바꿈(`newline`)을 우선으로 해야 함
   - 모바일에서 `submit` 모드 사용 시 줄바꿈 대체 수단(예: 전송 버튼) 제공을 권장
   - 키보드 힌트를 위해 `enterKeyHint` 전달을 지원해야 함 (예: `"enter"`, `"send"`)

4. 입력 제한/메타 정보
   - `maxLength` 지원
   - `showCount` 옵션으로 현재 글자 수/최대 글자 수 표시 가능
   - `invalid` 상태와 `errorMessage` 연결 가능

5. 접근성 및 스타일 확장
   - 기본 `textarea` 의미를 유지
   - `aria-invalid`, `aria-describedby` 연결 가능
   - 상태 노출 속성 지원: `data-disabled`, `data-readonly`, `data-invalid`, `data-overflow`

## 4. 우선순위 제안 (MVP -> 확장)

MVP (이번 구현):

- controlled/uncontrolled
- auto-resize (`minRows`, `maxRows`)
- Enter 동작 제어 (`newline`/`submit`, `Shift+Enter`, IME 예외)
- disabled/readOnly/invalid

확장 (다음 단계):

- 글자 수 카운터 UI
- 에러 메시지 슬롯/컴파운드 컴포넌트 분리
- 멘션/해시태그 같은 리치 입력 확장 훅

## 5. 모바일 동작 원칙

- 모바일에서도 `enterKeyBehavior="newline"`일 때 Enter는 항상 줄바꿈으로 동작해야 한다.
- `enterKeyBehavior="submit"`는 선택 옵션이며, 기본값은 `newline`으로 둔다.
- 모바일은 `Shift+Enter` 사용성이 낮으므로, submit 패턴에서는 별도 전송 버튼 UI를 함께 고려한다.
- IME 조합 중 Enter는 submit으로 처리하지 않는다.
