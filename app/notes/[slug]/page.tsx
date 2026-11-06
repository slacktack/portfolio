import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { Handoff, StoryRail } from "@/components/story";
import { getNextNote, getNote, notes, profile } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { title: "Note not found" };
  return {
    title: note.title,
    description: note.dek,
    openGraph: {
      type: "article",
      title: `${note.title} — Tushar Gautam`,
      description: note.dek,
    },
  };
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const next = getNextNote(slug);
  const index = notes.findIndex((n) => n.slug === slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.dek,
    datePublished: note.date,
    author: { "@type": "Person", name: profile.name },
  };

  return (
    <article className="article" data-note={note.slug}>
      <div className="wrap-narrow">
        <StoryRail current="notes" className="article-rail" />
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/notes">04 · Notes</Link>
          <span>/</span>
          <span>{note.category}</span>
        </div>

        <header className="article-head">
          <span className="ch-kicker" data-chapter="notes">
            <b>Chapter 04 · Note {String(index + 1).padStart(2, "0")}</b>
            <i />
            {note.category}
          </span>
          <h1 className="article-title">{note.title}</h1>
          <p className="lede">{note.dek}</p>
          <div className="article-meta">
            <span>{note.date}</span>
            <span>{note.readTime} read</span>
            <span>By {profile.name}</span>
          </div>
        </header>

        <div className="article-body">
          {note.sections.map((section, index) => (
            <section className="article-section" key={index}>
              {section.heading ? <h2>{section.heading}</h2> : null}
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.quote ? <blockquote className="pullquote">{section.quote}</blockquote> : null}
              {section.list ? (
                <ul className="article-list">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.code ? <pre className="code-block">{section.code}</pre> : null}
            </section>
          ))}
        </div>

        <footer className="article-foot">
          <span>
            Filed under {note.category} · {note.readTime}
          </span>
          <Link className="text-link" href="/notes">
            All notes
            <ArrowRight width={12} height={12} />
          </Link>
        </footer>

      </div>

      <Handoff
        from="notes"
        lead="That is one lesson. The person who learned it is the next chapter."
        side={{ href: `/notes/${next.slug}`, label: "Or the next note", title: next.title }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </article>
  );
}
