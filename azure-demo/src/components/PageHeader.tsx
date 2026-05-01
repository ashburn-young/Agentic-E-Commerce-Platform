import { cn } from "@/components/ui";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {eyebrow}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle ? <p className="max-w-3xl text-zinc-600">{subtitle}</p> : null}
    </div>
  );
}
