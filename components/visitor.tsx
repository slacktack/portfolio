"use client";

import { useId, useSyncExternalStore } from "react";

const KEY = "tg-visitor";
const EVT = "tg-visitor";
const MAX = 24;

function read(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setVisitor(name: string) {
  const v = name.replace(/\s+/g, " ").replace(/^\s+/, "").slice(0, MAX);
  try {
    if (v.trim()) sessionStorage.setItem(KEY, v);
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage blocked: the name lives for this render only
  }
  window.dispatchEvent(new Event(EVT));
}

export function useVisitor(): string {
  return useSyncExternalStore(subscribe, read, () => "");
}

// Prints the visitor's name, or a fallback until they type one.
export function Who({ fallback = "there", suffix = "" }: { fallback?: string; suffix?: string }) {
  const name = useVisitor().trim();
  return (
    <span className="zn-who" data-named={name ? "" : undefined}>
      {name || fallback}
      {suffix}
    </span>
  );
}

type FieldProps = { className?: string; label?: string; placeholder?: string; hint?: string };

export function NameField({ className = "", label = "Your name", placeholder = "your name", hint }: FieldProps) {
  const name = useVisitor();
  const id = useId();
  return (
    <span className={`zn-field ${className}`.trim()}>
      <label className="zn-field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="given-name"
        autoCapitalize="words"
        spellCheck={false}
        maxLength={MAX}
        placeholder={placeholder}
        value={name}
        onChange={(e) => setVisitor(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        size={Math.max(name.length, placeholder.length, 4)}
      />
      {hint ? (
        <span className="zn-field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
    </span>
  );
}
