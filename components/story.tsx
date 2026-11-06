import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/icons";
import { chapter, chapters, nextChapter, type ChapterId } from "@/components/chapters";

export function StoryRail({ current, className = "" }: { current: ChapterId | null; className?: string }) {
  const at = current ? chapters.findIndex((c) => c.id === current) : -1;
  return (
    <nav className={`story-rail ${className}`.trim()} aria-label="Chapters">
      {chapters.map((c, i) => (
        <Link
          key={c.id}
          href={c.href}
          className={i === at ? "is-on" : i < at ? "is-done" : undefined}
          aria-current={i === at ? "page" : undefined}
        >
          <b>{c.n}</b>
          <span>{c.name}</span>
        </Link>
      ))}
    </nav>
  );
}

type ChapterHeroProps = {
  id: ChapterId;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  kicker?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  className?: string;
  children?: ReactNode;
};

export function ChapterHero({ id, title, lede, aside, kicker, crumbs, className = "", children }: ChapterHeroProps) {
  const c = chapter(id);
  return (
    <section className={`ch-hero ${className}`.trim()} data-chapter={id}>
      <div className="wrap">
        <StoryRail current={id} />
        <span className="ch-numeral" aria-hidden="true">
          {c.n}
        </span>
        {crumbs ? (
          <div className="ch-crumbs">
            {crumbs.map((cr, i) =>
              cr.href ? (
                <Link href={cr.href} key={i}>
                  {cr.label}
                </Link>
              ) : (
                <span key={i}>{cr.label}</span>
              )
            )}
          </div>
        ) : null}
        <div className="ch-hero-grid">
          <div className="ch-hero-copy">
            <span className="ch-kicker">
              <b>Chapter {c.n}</b>
              <i />
              {kicker ?? c.name}
            </span>
            <h1 className="ch-title">{title}</h1>
            {lede ? <p className="ch-lede">{lede}</p> : null}
          </div>
          {aside ? <div className="ch-hero-aside">{aside}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

type HandoffProps = {
  from: ChapterId;
  lead: ReactNode;
  side?: { href: string; label: string; title: string };
  nextHref?: string;
};

export function Handoff({ from, lead, side, nextHref }: HandoffProps) {
  const here = chapter(from);
  const next = nextChapter(from);
  return (
    <section className="handoff" aria-label={`Next chapter: ${next.name}`}>
      <div className="wrap">
        <div className="handoff-top">
          <span>
            End of chapter {here.n} · {here.name}
          </span>
          <span className="handoff-line" />
          <span>
            {here.n} / {chapters[chapters.length - 1].n}
          </span>
        </div>
        <p className="handoff-lead">{lead}</p>
        <div className="handoff-grid">
          <Link className="handoff-next" href={nextHref ?? next.href}>
            <span className="handoff-k">Next · Chapter {next.n}</span>
            <strong>
              {next.name}
              <ArrowRight width={28} height={28} />
            </strong>
            <span className="handoff-line-copy">{next.line}</span>
            <span className="handoff-n" aria-hidden="true">
              {next.n}
            </span>
          </Link>
          {side ? (
            <Link className="handoff-side" href={side.href}>
              <span className="handoff-k">{side.label}</span>
              <strong>{side.title}</strong>
              <ArrowRight width={16} height={16} />
            </Link>
          ) : null}
        </div>
        <StoryRail current={from} className="handoff-rail" />
      </div>
    </section>
  );
}
