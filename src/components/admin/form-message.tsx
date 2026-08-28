type FormMessageProps = {
  success?: string;
  error?: string;
};

export function FormMessage({
  success,
  error,
}: FormMessageProps) {
  if (!success && !error) {
    return null;
  }

  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? success}
    </div>
  );
}