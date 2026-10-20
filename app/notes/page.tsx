import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { notes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Field notes",
  description:
    "Longer notes on low-latency systems, quotas, calibration, and backend engineering.",
};

export default function NotesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <span className="eyebrow">
              <span className="dot" />
              Field notes · {notes.length} entries
            </span>
            <h1 className="display-1">
              Notes from the <span className="serif">lower layers.</span>
            </h1>
            <p className="lede">
              Longer thoughts on latency, quotas, calibration, and the parts of backend
              work that do not fit in a bullet point.
            </p>
          </div>

          <div className="page-hero-aside">
            <p>
              <b>Written from the work.</b> Each note starts with a production constraint
              and ends with what I would do differently.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="notes-grid">
            {notes.map((note) => (
              <Link className="note-card" href={`/notes/${note.slug}`} key={note.slug}>
                <div className="note-meta">
                  <span>{note.category}</span>
                  <span>
                    {note.date} · {note.readTime}
                  </span>
                </div>
                <h2 className="note-title">{note.title}</h2>
                <p className="note-dek">{note.dek}</p>
                <div className="note-foot">
                  <span>Read note</span>
                  <ArrowUpRight width={13} height={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
