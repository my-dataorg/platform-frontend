import { cn } from "@/lib/utils";

export function ModuleCard({
  icon,
  title,
  description,
  href,
  onClick,
  className,
  transitionName,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  transitionName?: string;
}) {
  const inner = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shell text-shell-foreground">
        {icon}
      </div>
      <div className="mt-4">
        <h3 className="font-serif text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </>
  );

  const classes = cn(
    "motion-card block min-w-0 max-w-full rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/25",
    className
  );
  const style = transitionName ? { viewTransitionName: transitionName } : undefined;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={classes} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, "w-full text-left")} style={style}>
      {inner}
    </button>
  );
}
