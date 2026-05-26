import type { ReactNode } from "react";

interface PageHeaderProps {
  category: string;
  title: string;
  description: ReactNode;
}

export function PageHeader({ category, title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-tags">
        <span className="page-tag">{category}</span>
      </div>
      <h1>{title}</h1>
      <p className="page-lede">{description}</p>
    </header>
  );
}

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section className="page-section" id={id}>
      <h2>
        <a href={`#${id}`} className="anchor">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

interface SubSectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function SubSection({ id, title, children }: SubSectionProps) {
  return (
    <section className="page-subsection" id={id}>
      <h3>
        <a href={`#${id}`} className="anchor">
          {title}
        </a>
      </h3>
      {children}
    </section>
  );
}

interface InstallProps {
  npm: string;
  importStmt: string;
}

export function Install({ npm, importStmt }: InstallProps) {
  return (
    <div className="install">
      <div className="install-block">
        <div className="install-label">Install</div>
        <pre className="install-cmd">
          <code>{npm}</code>
        </pre>
      </div>
      <div className="install-block">
        <div className="install-label">Import</div>
        <pre className="install-cmd">
          <code>{importStmt}</code>
        </pre>
      </div>
    </div>
  );
}
