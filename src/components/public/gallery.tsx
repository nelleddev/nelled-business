"use client";

import {
  ChevronLeft,
  ChevronRight,
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

export function Gallery({
  items,
}: GalleryProps) {
  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState<number | null>(
    null,
  );

  const selected =
    selectedIndex === null
      ? null
      : items[selectedIndex];

  useEffect(() => {
    if (selectedIndex === null) {
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
        setSelectedIndex(null);
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
    selectedIndex,
    items.length,
  ]);

  if (items.length === 0) {
    return null;
  }

  function previous() {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return current === 0
        ? items.length - 1
        : current - 1;
    });
  }

  function next() {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return current ===
        items.length - 1
        ? 0
        : current + 1;
    });
  }

  return (
    <>
      {/* GRID */}
      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-3 md:gap-4 lg:auto-rows-[240px] lg:grid-cols-4">
        {items.map(
          (item, index) => {
            const featured =
              index === 0 &&
              items.length >= 4;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSelectedIndex(
                    index,
                  )
                }
                className={`group relative overflow-hidden rounded-2xl bg-slate-200 text-left ${
                  featured
                    ? "col-span-2 row-span-2"
                    : ""
                }`}
              >
                <Image
                  src={item.image_url}
                  alt={
                    item.alt_text ??
                    item.title ??
                    "Trabalho realizado"
                  }
                  fill
                  sizes={
                    featured
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  }
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent opacity-70 transition group-hover:opacity-90" />

                <div className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">
                  <Maximize2
                    size={16}
                  />
                </div>

                {item.title && (
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p
                      className={`font-semibold text-white ${
                        featured
                          ? "text-lg sm:text-xl"
                          : "text-sm sm:text-base"
                      }`}
                    >
                      {item.title}
                    </p>

                    {featured &&
                      item.description && (
                        <p className="mt-1 hidden max-w-lg text-sm leading-6 text-white/70 sm:block">
                          {
                            item.description
                          }
                        </p>
                      )}
                  </div>
                )}
              </button>
            );
          },
        )}
      </div>

      {/* LIGHTBOX */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de trabalhos"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedIndex(
                null,
              );
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-6"
        >
          {/* FECHAR */}
          <button
            type="button"
            onClick={() =>
              setSelectedIndex(null)
            }
            aria-label="Fechar galeria"
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {/* CONTADOR */}
          <div className="absolute left-4 top-5 z-30 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
            {(selectedIndex ?? 0) + 1}{" "}
            / {items.length}
          </div>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={previous}
                aria-label="Imagem anterior"
                className="absolute left-2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6 sm:h-12 sm:w-12"
              >
                <ChevronLeft
                  size={28}
                />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Próxima imagem"
                className="absolute right-2 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:h-12 sm:w-12"
              >
                <ChevronRight
                  size={28}
                />
              </button>
            </>
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
              <div className="mx-auto mt-5 max-w-3xl shrink-0 px-10 text-center text-white">
                {selected.title && (
                  <h3 className="text-lg font-semibold">
                    {
                      selected.title
                    }
                  </h3>
                )}

                {selected.description && (
                  <p className="mt-2 text-sm leading-6 text-white/60">
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