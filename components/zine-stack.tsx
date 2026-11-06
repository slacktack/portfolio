"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Word = { slug: string; word: string; line: string };

// Big pinned words track whichever system card is in view.
export function ZineStack({ words, children }: { words: Word[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-system]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setOn(cards.indexOf(e.target as HTMLElement));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div className="zs" ref={root} data-on={on}>
      <aside className="zs-words" aria-label="Systems in this chapter">
        <ol>
          {words.map((w, i) => (
            <li key={w.slug} className={i === on ? "is-on" : i < on ? "is-past" : undefined}>
              <Link href={`/systems/${w.slug}`} aria-current={i === on ? "true" : undefined}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{w.word}</span>
              </Link>
              <small>{w.line}</small>
            </li>
          ))}
        </ol>
      </aside>
      <div className="zs-cards">{children}</div>
    </div>
  );
}
