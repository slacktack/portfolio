import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { ChapterHero, Handoff } from "@/components/story";
import { notes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Field notes",
  description:
    "Longer notes on low-latency systems, quotas, calibration, and backend engineering.",
};

export default function NotesPage() {
  return (
    <>
      <ChapterHero
        id="notes"
        title={
          <>
            Notes from the <span className="serif">lower layers.</span>
          </>
        }
        lede="Longer thoughts on latency, quotas, calibration, and the parts of backend work that do not fit in a bullet point."
        aside={
          <p>
            <b>Written from the work.</b> Each note starts with a production constraint from chapter 01 and ends with
            what I would do differently. {notes.length} entries so far.
          </p>
        }
      />

      <section className="section">
        <div className="wrap">
          <div className="notes-grid">
            {notes.map((note, i) => (
              <Link className="note-card" href={`/notes/${note.slug}`} key={note.slug}>
                <span className="note-n">04.{i + 1}</span>
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

      <Handoff from="notes" lead="Enough about the systems. Here is the person who builds them." />
    </>
  );
}
