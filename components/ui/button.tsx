import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-primary)] text-white hover:opacity-95",
  secondary: "bg-[var(--color-accent)] text-white hover:opacity-95",
  outline:
    "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5",
  ghost: "text-slate-700 hover:bg-slate-100",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
