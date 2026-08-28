"use client";

import Image from "next/image";
import { useState } from "react";

type BeforeAfterSliderProps = {
  beforeUrl: string;
  afterUrl: string;
  title?: string | null;
  description?: string | null;
};

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  title,
  description,
}: BeforeAfterSliderProps) {
  const [position, setPosition] =
    useState(50);

  return (
    <article className="group">
      <div className="relative aspect-[4/3] select-none overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        {/* DEPOIS */}
        <Image
          src={afterUrl}
          alt={
            title
              ? `${title} - Depois`
              : "Resultado depois do serviço"
          }
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {/* ANTES */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${
              100 - position
            }% 0 0)`,
          }}
        >
          <Image
            src={beforeUrl}
            alt={
              title
                ? `${title} - Antes`
                : "Resultado antes do serviço"
            }
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* SOMBREAMENTO */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* LABEL ANTES */}
        <span className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur">
          Antes
        </span>

        {/* LABEL DEPOIS */}
        <span className="pointer-events-none absolute bottom-4 right-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-sm backdrop-blur">
          Depois
        </span>

        {/* LINHA DIVISÓRIA */}
        <div
          className="pointer-events-none absolute inset-y-0 z-20 w-[2px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)]"
          style={{
            left: `${position}%`,
          }}
        >
          {/* CONTROLE CENTRAL */}
          <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[var(--brand)] text-[var(--brand-foreground)] shadow-lg">
            <span className="flex items-center gap-[2px] text-lg font-bold">
              ‹
              <span className="text-xs">
                |
              </span>
              ›
            </span>
          </div>
        </div>

        {/* SLIDER INVISÍVEL */}
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={position}
          onChange={(event) =>
            setPosition(
              Number(
                event.target.value,
              ),
            )
          }
          aria-label="Comparar antes e depois"
          aria-valuetext={`${position}% da imagem antes`}
          className="absolute inset-0 z-30 h-full w-full cursor-col-resize opacity-0"
        />
      </div>

      {(title || description) && (
        <div className="mt-4">
          {title && (
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          )}
        </div>
      )}
    </article>
  );
}