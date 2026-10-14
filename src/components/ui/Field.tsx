"use client";

import { useId, type InputHTMLAttributes } from "react";

/** 라벨 위 · 입력 · 오류 아래. 오류는 색만이 아니라 글자로 알린다. */
export function Field({
  label,
  hint,
  error,
  className = "",
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-secondary text-2xs">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`text-primary placeholder:text-muted/60 ease-fluid min-h-12 w-full border bg-transparent px-4 text-sm transition-colors duration-300 ${
          error ? "border-error" : "border-interactive focus-visible:border-accent"
        }`}
        {...input}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-error text-2xs">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-muted text-2xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
