"use client";

import {
  ChevronLeft,
  ChevronRight,
  Images,
  Maximize2,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useState,
} from "react";

export type PublicGalleryItem = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  alt_text: string | null;
};

type GalleryProps = {
  items: PublicGalleryItem[];
};

const HOME_VISIBLE_IMAGES = 5;

export function Gallery({
  items,
}: GalleryProps) {
  const [
    galleryOpen,
    setGalleryOpen,
  ] = useState(false);

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState<number | null>(
    null,
  );

  const previewItems =
    items.slice(
      0,
      HOME_VISIBLE_IMAGES,
    );

  const selected =
    selectedIndex === null
      ? null
      : items[selectedIndex];

  const modalIsOpen =
    galleryOpen ||
    selectedIndex !== null;

  useEffect(() => {
    if (!modalIsOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        /*
         * Se estiver vendo uma foto
         * grande, volta para a galeria.
         */
        if (
          selectedIndex !== null
        ) {
          setSelectedIndex(null);

          return;
        }

        setGalleryOpen(false);
      }

      if (
        selectedIndex === null
      ) {
        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        setSelectedIndex(
          (current) => {
            if (current === null) {
              return null;
            }

            return current ===
              items.length - 1
              ? 0
              : current + 1;
          },
        );
      }

      if (
        event.key === "ArrowLeft"
      ) {
        setSelectedIndex(
          (current) => {
            if (current === null) {
              return null;
            }

            return current === 0
              ? items.length - 1
              : current - 1;
          },
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    modalIsOpen,
    selectedIndex,
    items.length,
  ]);

  if (items.length === 0) {
    return null;
  }

  function openGallery() {
    setGalleryOpen(true);
  }

  function closeGallery() {
    setGalleryOpen(false);
    setSelectedIndex(null);
  }

  function openImage(
    itemId: string,
  ) {
    const index =
      items.findIndex(
        (item) =>
          item.id === itemId,
      );

    if (index === -1) {
      return;
    }

    setGalleryOpen(true);
    setSelectedIndex(index);
  }

  function previous() {
    setSelectedIndex(
      (current) => {
        if (current === null) {
          return null;
        }

        return current === 0
          ? items.length - 1
          : current - 1;
      },
    );
  }

  function next() {
    setSelectedIndex(
      (current) => {
        if (current === null) {
          return null;
        }

        return current ===
          items.length - 1
          ? 0
          : current + 1;
      },
    );
  }

  return (
    <>
      {/* =========================
          PREVIEW DA HOME
      ========================== */}
      <div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:h-[500px] md:grid-cols-4 md:grid-rows-2">
          {previewItems.map(
            (item, index) => {
              const featured =
                index === 0;

              const isLast =
                index ===
                  previewItems.length -
                    1 &&
                items.length >
                  HOME_VISIBLE_IMAGES;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    openImage(
                      item.id,
                    )
                  }
                  className={`group relative cursor-pointer overflow-hidden rounded-lg bg-slate-200 ${
                    featured
                      ? "col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto"
                      : "aspect-square md:aspect-auto"
                  }`}
                >
                  <Image
                    src={
                      item.image_url
                    }
                    alt={
                      item.alt_text ??
                      item.title ??
                      "Trabalho realizado"
                    }
                    fill
                    sizes={
                      featured
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 25vw"
                    }
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/25" />

                  {/* ÍCONE */}
                  {!isLast && (
                    <div className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                      <Maximize2
                        size={16}
                      />
                    </div>
                  )}

                  {/* ÚLTIMA FOTO */}
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-3 text-white backdrop-blur-[1px]">
                      <div className="text-center">
                        <Images
                          size={28}
                          className="mx-auto"
                        />

                        <p className="mt-2 text-sm font-semibold sm:text-base">
                          Ver todas
                        </p>

                        <p className="mt-1 text-xs text-white/75">
                          {items.length}{" "}
                          fotos
                        </p>
                      </div>
                    </div>
                  )}

                  {!isLast &&
                    item.title && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-left">
                        <p
                          className={`font-semibold text-white ${
                            featured
                              ? "text-base sm:text-lg"
                              : "text-sm"
                          }`}
                        >
                          {
                            item.title
                          }
                        </p>
                      </div>
                    )}
                </button>
              );
            },
          )}
        </div>

        {/* BOTÃO ABAIXO */}
        {items.length >
          HOME_VISIBLE_IMAGES && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={openGallery}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
            >
              <Images size={18} />

              Ver galeria completa
            </button>
          </div>
        )}
      </div>

      {/* =========================
          MODAL GALERIA
      ========================== */}
      {galleryOpen &&
        selectedIndex === null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Galeria de trabalhos"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
            onMouseDown={(
              event,
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeGallery();
              }
            }}
          >
            <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-[var(--background)] shadow-2xl">
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-5 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-5 sm:px-7">
                <div>
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-[var(--accent)]">
                    TRABALHOS
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold text-[var(--surface-foreground)]">
                    Galeria de fotos
                  </h2>

                  <p className="mt-1 text-sm text-[var(--surface-muted)]">
                    {items.length}{" "}
                    {items.length === 1
                      ? "foto"
                      : "fotos"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeGallery
                  }
                  aria-label="Fechar galeria"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] text-[var(--surface-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FOTOS */}
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
                  {items.map(
                    (item) => (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          openImage(
                            item.id,
                          )
                        }
                        className="group relative mb-3 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg bg-slate-200 sm:mb-4"
                      >
                        <Image
                          src={
                            item.image_url
                          }
                          alt={
                            item.alt_text ??
                            item.title ??
                            "Trabalho realizado"
                          }
                          width={700}
                          height={700}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                          <Maximize2
                            size={16}
                          />
                        </div>

                        {item.title && (
                          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 pt-10 text-left transition duration-300 group-hover:translate-y-0">
                            <p className="text-sm font-semibold text-white">
                              {
                                item.title
                              }
                            </p>
                          </div>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* =========================
          VISUALIZAÇÃO DA FOTO
      ========================== */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da foto"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedIndex(
                null,
              );
            }
          }}
        >
          {/* VOLTAR */}
          <button
            type="button"
            onClick={() =>
              setSelectedIndex(null)
            }
            aria-label="Voltar para a galeria"
            className="absolute right-4 top-4 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {/* CONTADOR */}
          <div className="absolute left-4 top-5 z-30 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
            {(selectedIndex ??
              0) + 1}
            {" / "}
            {items.length}
          </div>

          {/* ANTERIOR */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={previous}
              aria-label="Imagem anterior"
              className="absolute left-2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6 sm:h-12 sm:w-12"
            >
              <ChevronLeft
                size={28}
              />
            </button>
          )}

          {/* PRÓXIMA */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Próxima imagem"
              className="absolute right-2 z-30 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:h-12 sm:w-12"
            >
              <ChevronRight
                size={28}
              />
            </button>
          )}

          <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col justify-center">
            <div className="relative min-h-0 flex-1">
              <Image
                src={
                  selected.image_url
                }
                alt={
                  selected.alt_text ??
                  selected.title ??
                  "Trabalho realizado"
                }
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {(selected.title ||
              selected.description) && (
              <div className="mx-auto mt-5 max-w-3xl shrink-0 px-12 text-center text-white">
                {selected.title && (
                  <h3 className="text-lg font-semibold">
                    {
                      selected.title
                    }
                  </h3>
                )}

                {selected.description && (
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {
                      selected.description
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}