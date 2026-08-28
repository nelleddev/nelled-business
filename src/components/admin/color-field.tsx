"use client";

import { useState } from "react";

type ColorFieldProps = {
  name:
    | "primary_color"
    | "secondary_color"
    | "accent_color";
  title: string;
  description: string;
  defaultValue: string;
};

function normalizeHex(value: string) {
  let color = value.trim();

  if (!color.startsWith("#")) {
    color = `#${color}`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return color;
  }

  return null;
}

export function ColorField({
  name,
  title,
  description,
  defaultValue,
}: ColorFieldProps) {
  const [color, setColor] =
    useState(defaultValue);

  const [textValue, setTextValue] =
    useState(defaultValue);

  function handlePickerChange(
    value: string,
  ) {
    setColor(value);
    setTextValue(value);
  }

  function handleTextChange(
    value: string,
  ) {
    setTextValue(value);

    const normalized =
      normalizeHex(value);

    if (normalized) {
      setColor(normalized);
    }
  }

  function handleBlur() {
    const normalized =
      normalizeHex(textValue);

    if (normalized) {
      setColor(normalized);
      setTextValue(normalized);
      return;
    }

    setTextValue(color);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="color"
          aria-label={`Selecionar ${title}`}
          value={color}
          onChange={(event) =>
            handlePickerChange(
              event.target.value,
            )
          }
          className="h-12 w-16 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />

        <input
          type="text"
          name={name}
          value={textValue}
          onChange={(event) =>
            handleTextChange(
              event.target.value,
            )
          }
          onBlur={handleBlur}
          maxLength={7}
          spellCheck={false}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      </div>

      <div
        className="mt-4 h-2 w-full rounded-full"
        style={{
          backgroundColor: color,
        }}
      />
    </div>
  );
}