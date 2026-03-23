import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("label을 렌더링한다", () => {
    render(<Button label="Click me" />);

    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("클릭 핸들러를 호출한다", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button label="Submit" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
