"use client";

import {
  ChevronLeft,
  ChevronRight,
  Star,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export type PublicReview = {
  id: string;
  customer_name: string;
  city: string | null;
  rating: number;
  comment: string;
};

type ReviewsGridProps = {
  reviews: PublicReview[];
};

const HOME_VISIBLE_REVIEWS = 3;
const REVIEWS_PER_PAGE = 6;

export function ReviewsGrid({
  reviews,
}: ReviewsGridProps) {
  const [open, setOpen] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const scrollAreaRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const homeReviews =
    reviews.slice(
      0,
      HOME_VISIBLE_REVIEWS,
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        reviews.length /
          REVIEWS_PER_PAGE,
      ),
    );

  const pageStart =
    (page - 1) *
    REVIEWS_PER_PAGE;

  const modalReviews =
    reviews.slice(
      pageStart,
      pageStart +
        REVIEWS_PER_PAGE,
    );

  const hasMore =
    reviews.length >
    HOME_VISIBLE_REVIEWS;

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        originalOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  function openModal() {
    setPage(1);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function changePage(
    nextPage: number,
  ) {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }

    setPage(nextPage);

    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-10 rounded-md border border-dashed border-[var(--border)] px-6 py-10 text-center">
        <Star
          size={28}
          className="mx-auto text-[var(--accent)]"
        />

        <p className="mt-4 font-semibold text-[var(--foreground)]">
          Ainda não há avaliações
          publicadas
        </p>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Seja o primeiro cliente a
          compartilhar sua experiência.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 3 AVALIAÇÕES NA HOME */}
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {homeReviews.map(
          (review) => (
            <ReviewCard
              key={review.id}
              review={review}
            />
          ),
        )}
      </div>

      {/* VER MAIS */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={openModal}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--accent)] bg-transparent px-5 py-3 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
          >
            Ver mais avaliações
          </button>
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reviews-modal-title"
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-2xl"
          >
            {/* CABEÇALHO */}
            <div className="flex shrink-0 items-start justify-between gap-6 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-5 sm:px-7">
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-[var(--accent)]">
                  CLIENTES
                </p>

                <h2
                  id="reviews-modal-title"
                  className="mt-2 text-2xl font-semibold text-[var(--surface-foreground)] sm:text-3xl"
                >
                  Todas as avaliações
                </h2>

                <p className="mt-2 text-sm text-[var(--surface-muted)]">
                  {reviews.length}{" "}
                  {reviews.length === 1
                    ? "avaliação publicada"
                    : "avaliações publicadas"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Fechar avaliações"
                title="Fechar"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] text-[var(--surface-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTEÚDO */}
            <div
              ref={scrollAreaRef}
              className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7"
            >
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {modalReviews.map(
                  (review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                    />
                  ),
                )}
              </div>
            </div>

            {/* PAGINAÇÃO */}
            <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-7">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-[var(--surface-muted)]">
                  Mostrando{" "}
                  <strong className="text-[var(--surface-foreground)]">
                    {pageStart + 1}
                  </strong>
                  {" – "}
                  <strong className="text-[var(--surface-foreground)]">
                    {Math.min(
                      pageStart +
                        REVIEWS_PER_PAGE,
                      reviews.length,
                    )}
                  </strong>
                  {" de "}
                  <strong className="text-[var(--surface-foreground)]">
                    {reviews.length}
                  </strong>
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        changePage(
                          page - 1,
                        )
                      }
                      disabled={
                        page === 1
                      }
                      aria-label="Página anterior"
                      title="Página anterior"
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] text-[var(--surface-foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft
                        size={18}
                      />
                    </button>

                    <div className="flex items-center gap-1">
                      {getVisiblePages(
                        page,
                        totalPages,
                      ).map(
                        (
                          pageNumber,
                        ) => (
                          <button
                            key={
                              pageNumber
                            }
                            type="button"
                            onClick={() =>
                              changePage(
                                pageNumber,
                              )
                            }
                            aria-current={
                              page ===
                              pageNumber
                                ? "page"
                                : undefined
                            }
                            className={`h-10 min-w-10 cursor-pointer rounded-md px-3 text-sm font-semibold transition ${
                              page ===
                              pageNumber
                                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                : "border border-[var(--border)] text-[var(--surface-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            }`}
                          >
                            {
                              pageNumber
                            }
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        changePage(
                          page + 1,
                        )
                      }
                      disabled={
                        page ===
                        totalPages
                      }
                      aria-label="Próxima página"
                      title="Próxima página"
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-[var(--border)] text-[var(--surface-foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight
                        size={18}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ReviewCard({
  review,
}: {
  review: PublicReview;
}) {
  const rating =
    Math.max(
      0,
      Math.min(
        review.rating,
        5,
      ),
    );

  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex gap-1 text-[var(--accent)]">
        {Array.from({
          length: rating,
        }).map(
          (_, index) => (
            <Star
              key={index}
              size={17}
              fill="currentColor"
            />
          ),
        )}
      </div>

      <p className="mt-5 flex-1 leading-7 text-[var(--surface-muted)]">
        “{review.comment}”
      </p>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <strong className="block text-[var(--surface-foreground)]">
          {
            review.customer_name
          }
        </strong>

        {review.city && (
          <span className="mt-1 block text-sm text-[var(--surface-muted)]">
            {review.city}
          </span>
        )}
      </div>
    </article>
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
) {
  if (totalPages <= 5) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1,
    );
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (
    currentPage >=
    totalPages - 2
  ) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}