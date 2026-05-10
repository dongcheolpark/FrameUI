import { useState } from "react";
import { Pagination, usePaginationContext } from "FrameUI";
import { Install, PageHeader, Section } from "../components/PageLayout";
import { Example } from "../components/Example";
import { PropTable } from "../components/PropTable";

const basicCode = `import { Pagination } from "FrameUI";
import { useState } from "react";

export function Demo() {
  const [page, setPage] = useState(1);
  return (
    <Pagination page={page} totalPages={20} onPageChange={setPage}>
      <Pagination.Prev>이전</Pagination.Prev>
      <Pagination.List />
      <Pagination.Next>다음</Pagination.Next>
    </Pagination>
  );
}`;

const compactCode = `import { Pagination, usePaginationContext } from "FrameUI";
import { useState } from "react";

function Status() {
  const { page, totalPages } = usePaginationContext();
  return <span aria-live="polite">{page} / {totalPages}</span>;
}

export function Demo() {
  const [page, setPage] = useState(1);
  return (
    <Pagination page={page} totalPages={20} onPageChange={setPage}>
      <Pagination.Prev aria-label="Previous page">‹</Pagination.Prev>
      <Status />
      <Pagination.Next aria-label="Next page">›</Pagination.Next>
    </Pagination>
  );
}`;

const boundaryCode = `<Pagination page={page} totalPages={50} onPageChange={setPage} siblingCount={2} boundaryCount={2}>
  <Pagination.Prev>‹</Pagination.Prev>
  <Pagination.List />
  <Pagination.Next>›</Pagination.Next>
</Pagination>`;

function BasicDemo() {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      page={page}
      totalPages={20}
      onPageChange={setPage}
      className="demo-pagination"
    >
      <Pagination.Prev className="demo-pagination-button">이전</Pagination.Prev>
      <Pagination.List className="demo-pagination-list" />
      <Pagination.Next className="demo-pagination-button">다음</Pagination.Next>
    </Pagination>
  );
}

function CompactDemo() {
  const [page, setPage] = useState(1);
  return (
    <Pagination
      page={page}
      totalPages={20}
      onPageChange={setPage}
      className="demo-pagination demo-pagination-compact"
    >
      <Pagination.Prev className="demo-pagination-button" aria-label="Previous page">
        ‹
      </Pagination.Prev>
      <CompactStatus />
      <Pagination.Next className="demo-pagination-button" aria-label="Next page">
        ›
      </Pagination.Next>
    </Pagination>
  );
}

function CompactStatus() {
  const { page, totalPages } = usePaginationContext();
  return (
    <span className="demo-pagination-status" aria-live="polite">
      {page} / {totalPages}
    </span>
  );
}

function BoundaryDemo() {
  const [page, setPage] = useState(25);
  return (
    <Pagination
      page={page}
      totalPages={50}
      onPageChange={setPage}
      siblingCount={2}
      boundaryCount={2}
      className="demo-pagination"
    >
      <Pagination.Prev className="demo-pagination-button" aria-label="Previous page">
        ‹
      </Pagination.Prev>
      <Pagination.List className="demo-pagination-list" />
      <Pagination.Next className="demo-pagination-button" aria-label="Next page">
        ›
      </Pagination.Next>
    </Pagination>
  );
}

export function PaginationPage() {
  return (
    <article className="page">
      <PageHeader
        category="Navigation"
        title="Pagination"
        description="ellipsis 계산, boundary 겹침, 1-based 페이지 번호, aria-current 같은 자잘한 함정을 모두 흡수한 헤드리스 페이지네이션."
      />

      <Install npm="npm install FrameUI" importStmt={`import { Pagination } from "FrameUI";`} />

      <Section id="basic-example" title="Basic example">
        <p>
          <code>totalPages</code> 와 <code>onPageChange</code> 만 주면 끝납니다. 화살표 끝 페이지에서는
          Prev/Next 가 자동으로 disabled 됩니다.
        </p>
        <Example preview={<BasicDemo />} code={basicCode} />
      </Section>

      <Section id="compact" title="Compact (mobile) layout">
        <p>
          모바일에서는 번호 나열을 포기하고 Prev / Next + 현재·전체 텍스트만 노출하는 것이 보통 더 낫습니다.
          Compound 로 내부 구조를 직접 조립하세요.
        </p>
        <Example preview={<CompactDemo />} code={compactCode} />
      </Section>

      <Section id="boundary" title="Sibling and boundary count">
        <p>
          <code>siblingCount</code> 는 현재 페이지 양쪽에 보여줄 번호 수, <code>boundaryCount</code> 는
          양 끝에 고정으로 보여줄 번호 수입니다. 모바일에서는 둘 다 0으로 줄여서 사용하는 패턴이 많습니다.
        </p>
        <Example preview={<BoundaryDemo />} code={boundaryCode} />
      </Section>

      <Section id="api" title="Component API">
        <h3>Pagination.Root</h3>
        <PropTable
          rows={[
            { prop: "page / defaultPage", type: "number", description: "Controlled / uncontrolled 현재 페이지 (1-based)." },
            { prop: "onPageChange", type: "(page: number) => void", description: "페이지 변경 콜백. 1-based page 번호 하나만 전달됩니다." },
            { prop: "totalPages", type: "number (필수)", description: "전체 페이지 수. 0 또는 1이면 Prev/Next 모두 disabled." },
            { prop: "siblingCount", type: "number", defaultValue: "1", description: "현재 페이지 양쪽에 보여줄 번호 수." },
            { prop: "boundaryCount", type: "number", defaultValue: "1", description: "양 끝에 고정으로 보여줄 번호 수." },
            { prop: "disabled", type: "boolean", defaultValue: "false", description: "전체 비활성화. 모든 서브 컴포넌트에 전파." },
            { prop: "aria-label", type: "string", defaultValue: `"Pagination"`, description: "nav 랜드마크의 접근성 이름." },
          ]}
        />

        <h3>Pagination.Item / Ellipsis / Prev / Next / First / Last</h3>
        <p>
          <code>Item</code> 은 <code>value: number</code> 를 받고 현재 페이지와 비교해 자동으로
          {" "}
          <code>aria-current="page"</code> 와 <code>data-state="active|inactive"</code> 를 부여합니다.
          {" "}
          <code>Prev / Next / First / Last</code> 는 경계에서 자동으로 disabled 됩니다.
          아이콘만 사용하면 기본 <code>aria-label</code>(<code>"Previous page"</code> 등)이 자동으로 적용됩니다.
        </p>
      </Section>
    </article>
  );
}
