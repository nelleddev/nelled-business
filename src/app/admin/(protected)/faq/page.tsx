import { Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  deleteFaq,
  saveFaq,
} from "./actions";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  position: number;
  is_active: boolean;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

export default async function FaqPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("faq_items")
    .select(
      `
        id,
        question,
        answer,
        position,
        is_active
      `,
    )
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .order("position");

  const faqItems =
    (data ?? []) as FaqItem[];

  return (
    <>
      <AdminPageHeader
        title="Perguntas frequentes"
        description="Cadastre e edite as dúvidas exibidas na landing page."
      />

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <form
          action={saveFaq}
          className="self-start space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h2 className="font-semibold text-slate-950">
            Nova pergunta
          </h2>

          <input
            name="question"
            required
            placeholder="Pergunta"
            className={inputClass}
          />

          <textarea
            name="answer"
            required
            rows={5}
            placeholder="Resposta"
            className={inputClass}
          />

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked
            />

            Ativa
          </label>

          <button className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-500">
            Adicionar
          </button>
        </form>

        <div className="space-y-3">
          {faqItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
              Nenhuma pergunta cadastrada.
            </div>
          )}

          {faqItems.map((item) => (
            <form
              action={saveFaq}
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <input
                type="hidden"
                name="id"
                value={item.id}
              />

              <div className="grid gap-3">
                <input
                  name="question"
                  defaultValue={
                    item.question
                  }
                  required
                  className={inputClass}
                />

                <textarea
                  name="answer"
                  defaultValue={
                    item.answer
                  }
                  required
                  rows={3}
                  className={inputClass}
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={
                        item.is_active
                      }
                    />

                    Ativa
                  </label>

                  <div className="flex gap-2">
                    <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                      Salvar
                    </button>

                    <button
                      formAction={deleteFaq}
                      className="rounded-lg border border-red-200 p-2 text-red-600"
                      aria-label="Excluir pergunta"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ))}
        </div>
      </div>
    </>
  );
}