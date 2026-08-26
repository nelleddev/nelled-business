type AdminPageHeaderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      {children && (
        <div className="shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}