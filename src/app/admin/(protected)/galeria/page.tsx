import Image from "next/image";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  addBeforeAfter,
  addGallery,
  deleteBeforeAfter,
  deleteGallery,
} from "./actions";

type GalleryItem = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  alt_text: string | null;
};

type BeforeAfterItem = {
  id: string;
  title: string | null;
  description: string | null;
  before_image_url: string;
  after_image_url: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

export default async function GalleryPage() {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const supabase = await createClient();

  const [
    galleryResult,
    beforeAfterResult,
  ] = await Promise.all([
    supabase
      .from("gallery_items")
      .select(
        `
          id,
          title,
          description,
          image_url,
          alt_text
        `,
      )
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .order("position"),

    supabase
      .from("before_after_items")
      .select(
        `
          id,
          title,
          description,
          before_image_url,
          after_image_url
        `,
      )
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .order("position"),
  ]);

  const gallery =
    (galleryResult.data ??
      []) as GalleryItem[];

  const beforeAfter =
    (beforeAfterResult.data ??
      []) as BeforeAfterItem[];

  return (
    <>
      <AdminPageHeader
        title="Galeria"
        description="Envie trabalhos e comparações de antes e depois. As imagens são armazenadas no Cloudinary."
      />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <form
            action={addGallery}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-semibold">
              Nova foto
            </h2>

            <input
              name="title"
              placeholder="Título"
              className={inputClass}
            />

            <textarea
              name="description"
              placeholder="Descrição"
              rows={3}
              className={inputClass}
            />

            <input
              name="alt_text"
              placeholder="Texto alternativo"
              className={inputClass}
            />

            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className={inputClass}
            />

            <button className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white">
              Enviar foto
            </button>
          </form>

          <form
            action={addBeforeAfter}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <h2 className="font-semibold">
              Novo antes/depois
            </h2>

            <input
              name="title"
              placeholder="Título"
              className={inputClass}
            />

            <textarea
              name="description"
              placeholder="Descrição"
              rows={3}
              className={inputClass}
            />

            <label className="block text-sm">
              Antes

              <input
                type="file"
                name="before"
                accept="image/*"
                required
                className={`${inputClass} mt-2`}
              />
            </label>

            <label className="block text-sm">
              Depois

              <input
                type="file"
                name="after"
                accept="image/*"
                required
                className={`${inputClass} mt-2`}
              />
            </label>

            <button className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">
              Adicionar comparação
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Trabalhos
          </h2>

          {gallery.length === 0 ? (
            <Empty text="Nenhuma foto adicionada à galeria." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map(
                (item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <Image
                      src={
                        item.image_url
                      }
                      alt={
                        item.alt_text ??
                        item.title ??
                        "Trabalho"
                      }
                      width={500}
                      height={400}
                      className="aspect-[4/3] w-full object-cover"
                    />

                    <div className="flex items-center justify-between gap-2 p-4">
                      <span className="truncate font-medium">
                        {item.title ??
                          "Sem título"}
                      </span>

                      <form
                        action={
                          deleteGallery
                        }
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />

                        <button className="text-sm text-red-600">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}

          <h2 className="mb-4 mt-10 text-lg font-semibold">
            Antes e depois
          </h2>

          {beforeAfter.length === 0 ? (
            <Empty text="Nenhuma comparação adicionada." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {beforeAfter.map(
                (item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <div className="grid grid-cols-2 overflow-hidden rounded-xl">
                      <Image
                        src={
                          item.before_image_url
                        }
                        alt="Antes"
                        width={400}
                        height={300}
                        className="aspect-[4/3] h-full w-full object-cover"
                      />

                      <Image
                        src={
                          item.after_image_url
                        }
                        alt="Depois"
                        width={400}
                        height={300}
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="truncate font-medium">
                        {item.title ??
                          "Comparação"}
                      </span>

                      <form
                        action={
                          deleteBeforeAfter
                        }
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={item.id}
                        />

                        <button className="text-sm text-red-600">
                          Excluir
                        </button>
                      </form>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}