import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Images,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormMessage } from "@/components/admin/form-message";
import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

import {
  addBeforeAfter,
  addGallery,
  deleteBeforeAfter,
  deleteGallery,
  moveBeforeAfter,
  moveGallery,
  toggleBeforeAfter,
  toggleBeforeAfterFeatured,
  toggleGallery,
  toggleGalleryFeatured,
  updateBeforeAfter,
  updateGallery,
} from "./actions";

type GalleryPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    editGallery?: string;
    editBeforeAfter?: string;
  }>;
};

type GalleryItem = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  alt_text: string | null;

  position: number;
  is_active: boolean;
  is_featured: boolean;
};

type BeforeAfterItem = {
  id: string;
  title: string | null;
  description: string | null;

  before_image_url: string;
  after_image_url: string;

  position: number;
  is_active: boolean;
  is_featured: boolean;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

const labelClass =
  "block text-sm font-medium text-slate-700";

export default async function GalleryPage({
  searchParams,
}: GalleryPageProps) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return null;
  }

  const params =
    await searchParams;

  const supabase =
    await createClient();

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
          alt_text,
          position,
          is_active,
          is_featured
        `,
      )
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .order("position", {
        ascending: true,
      }),

    supabase
      .from(
        "before_after_items",
      )
      .select(
        `
          id,
          title,
          description,
          before_image_url,
          after_image_url,
          position,
          is_active,
          is_featured
        `,
      )
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      )
      .order("position", {
        ascending: true,
      }),
  ]);

  const gallery =
    (galleryResult.data ??
      []) as GalleryItem[];

  const beforeAfter =
    (beforeAfterResult.data ??
      []) as BeforeAfterItem[];

  const editingGallery =
    params.editGallery
      ? gallery.find(
          (item) =>
            item.id ===
            params.editGallery,
        ) ?? null
      : null;

  const editingBeforeAfter =
    params.editBeforeAfter
      ? beforeAfter.find(
          (item) =>
            item.id ===
            params.editBeforeAfter,
        ) ?? null
      : null;

  const activePhotos =
    gallery.filter(
      (item) =>
        item.is_active,
    ).length;

  const activeComparisons =
    beforeAfter.filter(
      (item) =>
        item.is_active,
    ).length;

  return (
    <>
      <AdminPageHeader
        title="Galeria"
        description="Gerencie as fotos dos trabalhos e comparações de antes e depois exibidas no site."
      />

      <FormMessage
        success={params.success}
        error={params.error}
      />

      {/* RESUMO */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Fotos"
          value={gallery.length}
          description="cadastradas"
        />

        <SummaryCard
          label="Fotos visíveis"
          value={activePhotos}
          description="publicadas no site"
        />

        <SummaryCard
          label="Comparações"
          value={beforeAfter.length}
          description="cadastradas"
        />

        <SummaryCard
          label="Antes e depois"
          value={activeComparisons}
          description="visíveis no site"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        {/* =================================
            FORMULÁRIOS
        ================================== */}
        <div className="space-y-6 self-start xl:sticky xl:top-24">
          {/* FOTO */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {editingGallery ? (
                  <Pencil
                    size={18}
                    className="text-blue-600"
                  />
                ) : (
                  <Plus
                    size={18}
                    className="text-blue-600"
                  />
                )}

                <h2 className="font-semibold text-slate-950">
                  {editingGallery
                    ? "Editar foto"
                    : "Nova foto"}
                </h2>
              </div>

              {editingGallery && (
                <Link
                  href="/admin/galeria"
                  title="Cancelar edição"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={18} />
                </Link>
              )}
            </div>

            <form
              action={
                editingGallery
                  ? updateGallery
                  : addGallery
              }
              className="mt-5 space-y-4"
            >
              {editingGallery && (
                <input
                  type="hidden"
                  name="id"
                  value={
                    editingGallery.id
                  }
                />
              )}

              <label className={labelClass}>
                Título

                <input
                  name="title"
                  defaultValue={
                    editingGallery
                      ?.title ?? ""
                  }
                  placeholder="Ex.: Forro de gesso na sala"
                  className={
                    inputClass
                  }
                />
              </label>

              <label className={labelClass}>
                Descrição

                <textarea
                  name="description"
                  rows={3}
                  defaultValue={
                    editingGallery
                      ?.description ??
                    ""
                  }
                  placeholder="Descreva brevemente o trabalho realizado."
                  className={
                    inputClass
                  }
                />
              </label>

              <label className={labelClass}>
                Texto alternativo

                <input
                  name="alt_text"
                  defaultValue={
                    editingGallery
                      ?.alt_text ?? ""
                  }
                  placeholder="Ex.: Forro de gesso instalado em sala"
                  className={
                    inputClass
                  }
                />

                <span className="mt-2 block text-xs font-normal text-slate-500">
                  Ajuda na acessibilidade e SEO.
                </span>
              </label>

              {editingGallery && (
                <Image
                  src={
                    editingGallery.image_url
                  }
                  alt={
                    editingGallery.alt_text ??
                    editingGallery.title ??
                    "Foto atual"
                  }
                  width={500}
                  height={350}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              )}

              <label className={labelClass}>
                {editingGallery
                  ? "Substituir imagem"
                  : "Imagem"}

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required={
                    !editingGallery
                  }
                  className={
                    inputClass
                  }
                />

                {editingGallery && (
                  <span className="mt-2 block text-xs font-normal text-slate-500">
                    Deixe vazio para manter a imagem atual.
                  </span>
                )}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_featured"
                    defaultChecked={
                      editingGallery
                        ?.is_featured ??
                      false
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  Destaque
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={
                      editingGallery
                        ?.is_active ??
                      true
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  Visível
                </label>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                {editingGallery
                  ? "Salvar alterações"
                  : "Enviar foto"}
              </button>
            </form>
          </section>

          {/* ANTES / DEPOIS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {editingBeforeAfter ? (
                  <Pencil
                    size={18}
                    className="text-slate-700"
                  />
                ) : (
                  <Plus
                    size={18}
                    className="text-slate-700"
                  />
                )}

                <h2 className="font-semibold text-slate-950">
                  {editingBeforeAfter
                    ? "Editar antes/depois"
                    : "Novo antes/depois"}
                </h2>
              </div>

              {editingBeforeAfter && (
                <Link
                  href="/admin/galeria"
                  title="Cancelar edição"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={18} />
                </Link>
              )}
            </div>

            <form
              action={
                editingBeforeAfter
                  ? updateBeforeAfter
                  : addBeforeAfter
              }
              className="mt-5 space-y-4"
            >
              {editingBeforeAfter && (
                <input
                  type="hidden"
                  name="id"
                  value={
                    editingBeforeAfter.id
                  }
                />
              )}

              <label className={labelClass}>
                Título

                <input
                  name="title"
                  defaultValue={
                    editingBeforeAfter
                      ?.title ?? ""
                  }
                  placeholder="Ex.: Reforma da sala"
                  className={
                    inputClass
                  }
                />
              </label>

              <label className={labelClass}>
                Descrição

                <textarea
                  name="description"
                  rows={3}
                  defaultValue={
                    editingBeforeAfter
                      ?.description ??
                    ""
                  }
                  placeholder="Descreva a transformação realizada."
                  className={
                    inputClass
                  }
                />
              </label>

              {editingBeforeAfter && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Antes atual
                    </p>

                    <Image
                      src={
                        editingBeforeAfter
                          .before_image_url
                      }
                      alt="Antes"
                      width={300}
                      height={220}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Depois atual
                    </p>

                    <Image
                      src={
                        editingBeforeAfter
                          .after_image_url
                      }
                      alt="Depois"
                      width={300}
                      height={220}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  </div>
                </div>
              )}

              <label className={labelClass}>
                {editingBeforeAfter
                  ? "Substituir imagem Antes"
                  : "Antes"}

                <input
                  type="file"
                  name="before"
                  accept="image/*"
                  required={
                    !editingBeforeAfter
                  }
                  className={
                    inputClass
                  }
                />
              </label>

              <label className={labelClass}>
                {editingBeforeAfter
                  ? "Substituir imagem Depois"
                  : "Depois"}

                <input
                  type="file"
                  name="after"
                  accept="image/*"
                  required={
                    !editingBeforeAfter
                  }
                  className={
                    inputClass
                  }
                />
              </label>

              {editingBeforeAfter && (
                <p className="text-xs text-slate-500">
                  Se não quiser trocar uma das imagens, deixe o respectivo campo vazio.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_featured"
                    defaultChecked={
                      editingBeforeAfter
                        ?.is_featured ??
                      false
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  Destaque
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={
                      editingBeforeAfter
                        ?.is_active ??
                      true
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />

                  Visível
                </label>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {editingBeforeAfter
                  ? "Salvar comparação"
                  : "Adicionar comparação"}
              </button>
            </form>
          </section>
        </div>

        {/* =================================
            LISTAGENS
        ================================== */}
        <div className="min-w-0 space-y-10">
          {/* GALERIA */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                  <Images
                    size={19}
                    className="text-blue-600"
                  />

                  Trabalhos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  A ordem abaixo é a mesma utilizada no site.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {gallery.length}{" "}
                {gallery.length === 1
                  ? "foto"
                  : "fotos"}
              </span>
            </div>

            {gallery.length === 0 ? (
              <Empty text="Nenhuma foto adicionada à galeria." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {gallery.map(
                  (
                    item,
                    index,
                  ) => (
                    <article
                      key={item.id}
                      className={`overflow-hidden rounded-2xl border bg-white transition ${
                        editingGallery?.id ===
                        item.id
                          ? "border-blue-400 ring-2 ring-blue-100"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="relative">
                        <Image
                          src={
                            item.image_url
                          }
                          alt={
                            item.alt_text ??
                            item.title ??
                            "Trabalho"
                          }
                          width={600}
                          height={450}
                          className="aspect-[4/3] w-full object-cover"
                        />

                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <StatusBadge
                            active={
                              item.is_active
                            }
                          />

                          {item.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-amber-950 shadow-sm">
                              <Star
                                size={11}
                                fill="currentColor"
                              />

                              Destaque
                            </span>
                          )}
                        </div>

                        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="truncate font-semibold text-slate-950">
                          {item.title ??
                            "Sem título"}
                        </h3>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                          <MoveButton
                            id={item.id}
                            direction="up"
                            action={
                              moveGallery
                            }
                            disabled={
                              index === 0
                            }
                          />

                          <MoveButton
                            id={item.id}
                            direction="down"
                            action={
                              moveGallery
                            }
                            disabled={
                              index ===
                              gallery.length -
                                1
                            }
                          />

                          <Link
                            href={`/admin/galeria?editGallery=${encodeURIComponent(
                              item.id,
                            )}`}
                            title="Editar"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil
                              size={15}
                            />
                          </Link>

                          <form
                            action={
                              toggleGallery
                            }
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={
                                item.id
                              }
                            />

                            <input
                              type="hidden"
                              name="is_active"
                              value={String(
                                item.is_active,
                              )}
                            />

                            <IconButton
                              title={
                                item.is_active
                                  ? "Ocultar"
                                  : "Publicar"
                              }
                            >
                              {item.is_active ? (
                                <EyeOff
                                  size={15}
                                />
                              ) : (
                                <Eye
                                  size={15}
                                />
                              )}
                            </IconButton>
                          </form>

                          <form
                            action={
                              toggleGalleryFeatured
                            }
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={
                                item.id
                              }
                            />

                            <input
                              type="hidden"
                              name="is_featured"
                              value={String(
                                item.is_featured,
                              )}
                            />

                            <button
                              type="submit"
                              title={
                                item.is_featured
                                  ? "Remover destaque"
                                  : "Destacar"
                              }
                              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                                item.is_featured
                                  ? "border-amber-200 bg-amber-50 text-amber-600"
                                  : "border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                              }`}
                            >
                              <Star
                                size={15}
                                fill={
                                  item.is_featured
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </form>

                          <form
                            action={
                              deleteGallery
                            }
                            className="ml-auto"
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={
                                item.id
                              }
                            />

                            <button
                              type="submit"
                              title="Excluir"
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>

          {/* ANTES E DEPOIS */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Antes e depois
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Comparações exibidas na seção de transformação do site.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {beforeAfter.length}
              </span>
            </div>

            {beforeAfter.length === 0 ? (
              <Empty text="Nenhuma comparação adicionada." />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {beforeAfter.map(
                  (
                    item,
                    index,
                  ) => (
                    <article
                      key={item.id}
                      className={`overflow-hidden rounded-2xl border bg-white transition ${
                        editingBeforeAfter?.id ===
                        item.id
                          ? "border-blue-400 ring-2 ring-blue-100"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="relative grid grid-cols-2">
                        <div className="relative">
                          <Image
                            src={
                              item.before_image_url
                            }
                            alt="Antes"
                            width={500}
                            height={375}
                            className="aspect-[4/3] w-full object-cover"
                          />

                          <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                            Antes
                          </span>
                        </div>

                        <div className="relative">
                          <Image
                            src={
                              item.after_image_url
                            }
                            alt="Depois"
                            width={500}
                            height={375}
                            className="aspect-[4/3] w-full object-cover"
                          />

                          <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
                            Depois
                          </span>
                        </div>

                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <StatusBadge
                            active={
                              item.is_active
                            }
                          />

                          {item.is_featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-amber-950">
                              <Star
                                size={11}
                                fill="currentColor"
                              />

                              Destaque
                            </span>
                          )}
                        </div>

                        <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="truncate font-semibold text-slate-950">
                          {item.title ??
                            "Comparação"}
                        </h3>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                          <MoveButton
                            id={item.id}
                            direction="up"
                            action={
                              moveBeforeAfter
                            }
                            disabled={
                              index === 0
                            }
                          />

                          <MoveButton
                            id={item.id}
                            direction="down"
                            action={
                              moveBeforeAfter
                            }
                            disabled={
                              index ===
                              beforeAfter.length -
                                1
                            }
                          />

                          <Link
                            href={`/admin/galeria?editBeforeAfter=${encodeURIComponent(
                              item.id,
                            )}`}
                            title="Editar"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil
                              size={15}
                            />
                          </Link>

                          <form
                            action={
                              toggleBeforeAfter
                            }
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={
                                item.id
                              }
                            />

                            <input
                              type="hidden"
                              name="is_active"
                              value={String(
                                item.is_active,
                              )}
                            />

                            <IconButton
                              title={
                                item.is_active
                                  ? "Ocultar"
                                  : "Publicar"
                              }
                            >
                              {item.is_active ? (
                                <EyeOff
                                  size={15}
                                />
                              ) : (
                                <Eye
                                  size={15}
                                />
                              )}
                            </IconButton>
                          </form>

                          <form
                            action={
                              toggleBeforeAfterFeatured
                            }
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={
                                item.id
                              }
                            />

                            <input
                              type="hidden"
                              name="is_featured"
                              value={String(
                                item.is_featured,
                              )}
                            />

                            <button
                              type="submit"
                              title={
                                item.is_featured
                                  ? "Remover destaque"
                                  : "Destacar"
                              }
                              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition ${
                                item.is_featured
                                  ? "border-amber-200 bg-amber-50 text-amber-600"
                                  : "border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                              }`}
                            >
                              <Star
                                size={15}
                                fill={
                                  item.is_featured
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </form>

                          <form
                            action={
                              deleteBeforeAfter
                            }
                            className="ml-auto"
                          >
                            <input
                              type="hidden"
                              name="id"
                              value={
                                item.id
                              }
                            />

                            <button
                              type="submit"
                              title="Excluir"
                              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
        active
          ? "bg-emerald-500 text-white"
          : "bg-slate-700 text-white"
      }`}
    >
      {active
        ? "Visível"
        : "Oculto"}
    </span>
  );
}

function MoveButton({
  id,
  direction,
  action,
  disabled,
}: {
  id: string;
  direction: "up" | "down";
  action: (
    formData: FormData,
  ) => void | Promise<void>;
  disabled: boolean;
}) {
  const Icon =
    direction === "up"
      ? ArrowUp
      : ArrowDown;

  return (
    <form action={action}>
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <input
        type="hidden"
        name="direction"
        value={direction}
      />

      <button
        type="submit"
        disabled={disabled}
        title={
          direction === "up"
            ? "Mover para cima"
            : "Mover para baixo"
        }
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Icon size={15} />
      </button>
    </form>
  );
}

function IconButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      title={title}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
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