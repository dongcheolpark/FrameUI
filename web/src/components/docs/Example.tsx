import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

interface ExampleProps {
  preview: ReactNode;
  code: string;
}

export function Example({ preview, code }: ExampleProps) {
  return (
    <div className="example">
      <div className="example-preview">{preview}</div>
      <CodeBlock code={code} />
    </div>
  );
}
