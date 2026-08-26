import { AdminPageHeader } from "@/components/admin/admin-page-header";

type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({
  title,
  description,
}: AdminPlaceholderProps) {
  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
          <div>
            <p className="font-semibold text-slate-800">
              Módulo preparado
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Vamos implementar as funções desta área na próxima etapa.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}