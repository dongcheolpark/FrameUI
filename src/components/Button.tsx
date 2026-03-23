import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function Button({ label, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} {...props}>
      {label}
    </button>
  );
}
