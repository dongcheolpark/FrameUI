import { PageHeader, Section } from "@/components/docs/PageLayout";
import { CodeBlock } from "@/components/docs/CodeBlock";

export function IntroPage() {
  return (
    <article className="page">
      <PageHeader
        category="Getting started"
        title="Introduction"
        description="FrameUI는 React 19에 맞춰 설계된 헤드리스 UI 컴포넌트 라이브러리입니다. 모든 컴포넌트는 controlled / uncontrolled 패턴을 지원하며, 스타일을 강제하지 않습니다."
      />

      <Section id="installation" title="Installation">
        <p>
          패키지 매니저로 설치하세요. 워크스페이스에서는{" "}
          <code>workspace:*</code>로 참조합니다.
        </p>
        <CodeBlock
          language="bash"
          code={`npm install @frameui57/frame-ui\n# or\npnpm add @frameui57/frame-ui`}
        />
      </Section>

      <Section id="philosophy" title="Philosophy">
        <p>
          FrameUI 컴포넌트는 동작(상태, 키보드, 접근성)만 제공하고 외관은
          사용자가 직접 정의합니다. 각 컴포넌트는 <code>data-ui</code>,{" "}
          <code>data-state</code>, <code>data-disabled</code> 등 데이터 속성을
          노출하므로 CSS 셀렉터로 상태별 스타일링이 가능합니다.
        </p>
      </Section>

      <Section id="overview" title="Overview">
        <p>다음 컴포넌트가 제공됩니다.</p>
        <ul className="page-list">
          <li>
            <a href="#/button">Button</a> — 기본 버튼
          </li>
          <li>
            <a href="#/switch">Switch</a> — 토글 스위치
          </li>
          <li>
            <a href="#/slider">Slider</a> — 범위 입력
          </li>
          <li>
            <a href="#/textarea">Textarea</a> — 자동 높이 조절 다중 라인 입력
          </li>
          <li>
            <a href="#/checkbox-cards">CheckboxCards</a> — 카드형 체크박스 그룹
          </li>
          <li>
            <a href="#/radio-cards">RadioCards</a> — 카드형 라디오 그룹
          </li>
          <li>
            <a href="#/file-dropzone">FileDropzone</a> — 드래그 앤 드롭 파일
            업로드
          </li>
          <li>
            <a href="#/date-picker">DatePicker</a> — 달력 팝오버 날짜 선택
          </li>
          <li>
            <a href="#/tabs">Tabs</a> — 탭 네비게이션
          </li>
          <li>
            <a href="#/accordion">Accordion</a> — 접기/펼치기 패널
          </li>
          <li>
            <a href="#/carousel">Carousel</a> — 슬라이드 캐러셀
          </li>
          <li>
            <a href="#/modal">Modal</a> — 모달 다이얼로그
          </li>
          <li>
            <a href="#/popup">Popup</a> — 토스트 팝업
          </li>
        </ul>
      </Section>
    </article>
  );
}
