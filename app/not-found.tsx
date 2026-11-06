import Link from "next/link";
import { ArrowRight, HomeIcon } from "@/components/icons";
import { navChapters } from "@/components/chapters";
import { StoryRail } from "@/components/story";

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="wrap">
        <StoryRail current={null} className="notfound-rail" />
        <div className="notfound-grid">
          <div className="notfound-code" aria-hidden="true">
            4<span>0</span>4
          </div>

          <div className="notfound-copy">
            <span className="ch-kicker">
              <b>No chapter</b>
              <i />
              route not found
            </span>
            <h1 className="display-2">
              This page is not <span className="serif">in the story.</span>
            </h1>
            <p className="lede">
              It is not in the routing table. It may have moved, or it may never have existed. Every chapter is still
              one hop away.
            </p>
            <ol className="notfound-chapters">
              {navChapters.map((c) => (
                <li key={c.id}>
                  <Link href={c.href}>
                    <b>{c.n}</b>
                    <span>{c.name}</span>
                    <ArrowRight width={13} height={13} />
                  </Link>
                </li>
              ))}
            </ol>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/">
                <HomeIcon width={14} height={14} />
                Back to chapter 00
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
