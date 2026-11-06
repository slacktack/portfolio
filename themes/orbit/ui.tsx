import type { CSSProperties, ReactNode } from "react";
import type { MarkKey } from "./data";

const paths: Record<MarkKey | "beacon", ReactNode> = {
  tower: (
    <>
      <path d="M9 21h6M11 21v-9M13 21v-9M7.5 12h9L15 7H9z" />
      <path d="M12 7V3.5M10 5h4" />
    </>
  ),
  hangar: (
    <>
      <path d="M3 20v-6a9 9 0 0 1 18 0v6M2.5 20h19" />
      <path d="M8 20v-5h8v5M8 17.5h8" />
    </>
  ),
  dome: (
    <>
      <path d="M4 18a8 8 0 0 1 16 0M2.5 18h19M5 21h14" />
      <circle cx="12" cy="13.5" r="2" />
    </>
  ),
  library: (
    <>
      <path d="M3 9.5 12 4l9 5.5M3 20.5h18M4 9.5h16" />
      <path d="M6 9.5v9M10 9.5v9M14 9.5v9M18 9.5v9" />
    </>
  ),
  cottage: (
    <>
      <path d="M3.5 11.5 12 4l8.5 7.5M6 10v10.5h12V10" />
      <path d="M10 20.5v-5h4v5M16 4.5V7.5" />
    </>
  ),
  portal: (
    <>
      <path d="M6 20.5v-8a6 6 0 0 1 12 0v8M3.5 20.5h17" />
      <path d="M12 10.5v4M10 12.5h4" />
    </>
  ),
  void: <path d="M6.5 21V3.5M6.5 4l10 4.2-10 4.2" />,
  beacon: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M12 10v10M8 20.5h8M6 4.5a7 7 0 0 0 0 5M18 4.5a7 7 0 0 1 0 5" />
    </>
  ),
};

export function Glyph({ k, size = 20 }: { k: MarkKey | "beacon"; size?: number }) {
  return (
    <svg className="ob-glyph" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[k]}
    </svg>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="ob-kbd">{children}</kbd>;
}

export function Arrow({ dir = "right" }: { dir?: "right" | "out" | "left" }) {
  const d = dir === "out" ? "M7 17 17 7M9 7h8v8" : dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const tint = (c: string) => ({ "--ob-c": c }) as CSSProperties;

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="ob-kick">{children}</p>;
}

export function SectionHead({ k, title, note }: { k: string; title: ReactNode; note?: ReactNode }) {
  return (
    <header className="ob-shead">
      <span className="ob-shead-k">{k}</span>
      <h3>{title}</h3>
      {note ? <p>{note}</p> : null}
    </header>
  );
}
