"use client";

import {
  Star,
  X,
} from "lucide-react";
import {
  useActionState,
  useState,
} from "react";

import {
  submitReview,
  type ReviewActionState,
} from "@/app/actions";

const initialState: ReviewActionState =
  {
    status: "idle",
    message: "",
  };

export function ReviewForm() {
  const [open, setOpen] =
    useState(false);

  const [rating, setRating] =
    useState(0);

  const [hoveredRating, setHoveredRating] =
    useState(0);

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    submitReview,
    initialState,
  );

  const visibleRating =
    hoveredRating || rating;

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--accent)] bg-transparent px-5 py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
      >
        <Star size={17} />

        Deixar avaliação
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-[var(--accent)]">
                  SUA EXPERIÊNCIA
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[var(--surface-foreground)]">
                  Deixe sua avaliação
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--surface-muted)]">
                  Conte como foi sua
                  experiência com o serviço.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] text-[var(--surface-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <X size={19} />
              </button>
            </div>

            {state.status ===
            "success" ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Star
                    size={25}
                    fill="currentColor"
                  />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-[var(--surface-foreground)]">
                  Avaliação recebida!
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--surface-muted)]">
                  {state.message}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="mt-6 cursor-pointer rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form
                action={formAction}
                className="space-y-5 p-5 sm:p-6"
              >
                {/* HONEYPOT */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                >
                  <label>
                    Website

                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>

                {/* ESTRELAS */}
                <div>
                  <p className="text-sm font-medium text-[var(--surface-foreground)]">
                    Sua nota
                  </p>

                  <input
                    type="hidden"
                    name="rating"
                    value={rating}
                  />

                  <div
                    className="mt-2 flex gap-1"
                    onMouseLeave={() =>
                      setHoveredRating(
                        0,
                      )
                    }
                  >
                    {[
                      1,
                      2,
                      3,
                      4,
                      5,
                    ].map(
                      (value) => {
                        const active =
                          value <=
                          visibleRating;

                        return (
                          <button
                            key={
                              value
                            }
                            type="button"
                            aria-label={`${value} ${
                              value ===
                              1
                                ? "estrela"
                                : "estrelas"
                            }`}
                            onClick={() =>
                              setRating(
                                value,
                              )
                            }
                            onMouseEnter={() =>
                              setHoveredRating(
                                value,
                              )
                            }
                            className="cursor-pointer p-1 transition hover:scale-110"
                          >
                            <Star
                              size={28}
                              className={
                                active
                                  ? "text-[var(--accent)]"
                                  : "text-slate-300"
                              }
                              fill={
                                active
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <ReviewField
                  label="Nome"
                  name="customer_name"
                  placeholder="Seu nome"
                  required
                  maxLength={100}
                />

                <ReviewField
                  label="Cidade"
                  name="city"
                  placeholder="Ex.: Penedo/AL"
                  maxLength={120}
                />

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--surface-foreground)]">
                    Sua avaliação
                  </span>

                  <textarea
                    name="comment"
                    required
                    rows={5}
                    minLength={10}
                    maxLength={1500}
                    placeholder="Conte como foi sua experiência com o serviço..."
                    className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                  />
                </label>

                {state.status ===
                  "error" && (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {
                      state.message
                    }
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setOpen(false)
                    }
                    className="cursor-pointer rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--surface-foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      pending ||
                      rating === 0
                    }
                    className="cursor-pointer rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending
                      ? "Enviando..."
                      : "Enviar avaliação"}
                  </button>
                </div>

                <p className="text-center text-xs leading-5 text-[var(--surface-muted)]">
                  A avaliação será
                  publicada após aprovação.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ReviewField({
  label,
  name,
  placeholder,
  required = false,
  maxLength,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--surface-foreground)]">
        {label}
      </span>

      <input
        type="text"
        name={name}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
      />
    </label>
  );
}