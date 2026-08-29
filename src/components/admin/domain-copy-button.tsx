"use client";

import {
  Check,
  Copy,
} from "lucide-react";
import {
  useState,
} from "react";

type DomainCopyButtonProps = {
  value: string;
  label?: string;
};

export function DomainCopyButton({
  value,
  label = "Copiar",
}: DomainCopyButtonProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1800,
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      {copied ? (
        <>
          <Check
            size={14}
            className="text-emerald-600"
          />

          Copiado
        </>
      ) : (
        <>
          <Copy size={14} />

          {label}
        </>
      )}
    </button>
  );
}