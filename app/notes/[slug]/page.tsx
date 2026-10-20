import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.dek,
    datePublished: note.date,
    author: { "@type": "Person", name: profile.name },
  };

  return (
    <article className="article">
      <div className="wrap-narrow">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/notes">Field notes</Link>
          <span>/</span>
          <span>{note.category}</span>
        </div>

        <header className="article-head">
          <span className="eyebrow">
            <span className="dot" />
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

        <Link className="note-next" href={`/notes/${next.slug}`}>
          <div>
            <span className="eyebrow">
              <span className="dot" />
              Next note
            </span>
            <strong>{next.title}</strong>
          </div>
          <ArrowUpRight width={18} height={18} />
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </article>
  );
}
