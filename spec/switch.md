# FrameUI Component Spec

## 1. 컴포넌트 개요

- 컴포넌트 이름: Switch
- 한 줄 설명: on/off 상태를 토글하는 접근성 기반 스위치 컴포넌트

## 2. 해결할 문제

- 체크박스와 유사한 토글 기능이 필요하지만, UI는 스위치 형태로 표현하고 싶다.
- 키보드(특히 Space/Enter)와 스크린리더에서 일관된 상호작용을 제공해야 한다.
- Controlled/Uncontrolled 모두 지원해서 폼/설정 화면에서 유연하게 사용하고 싶다.

## 3. 필요한 필수 기능

1. 클릭 또는 키보드 입력으로 상태를 토글할 수 있어야 한다.
2. `checked`, `defaultChecked`, `onCheckedChange` API를 제공해야 한다.
3. 비활성화(`disabled`) 상태를 지원하고, 스타일링을 위해 상태(`data-state`)를 노출해야 한다.
