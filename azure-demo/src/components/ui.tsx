import * as React from "react";
import clsx from "clsx";

export function cn(...args: Array<string | undefined | null | false>) {
  return clsx(args);
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/5 bg-white/70 shadow-sm backdrop-blur",
        "dark:border-white/10 dark:bg-white/5",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
        "bg-zinc-500/10 text-zinc-700 dark:text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variantClass =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : variant === "secondary"
        ? "bg-white/70 text-zinc-900 hover:bg-white border border-black/5 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:border-white/10"
        : variant === "danger"
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "bg-transparent text-zinc-800 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
        "transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-black/10 bg-white/70 px-3 text-sm",
        "shadow-sm outline-none ring-indigo-500/20 focus:ring-4",
        "dark:border-white/10 dark:bg-white/5",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm",
        "shadow-sm outline-none ring-indigo-500/20 focus:ring-4",
        "dark:border-white/10 dark:bg-white/5",
        className,
      )}
      {...props}
    />
  );
}
