import Link from "next/link";
import { ArrowRight, HomeIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="wrap notfound-grid">
        <div className="notfound-code" aria-hidden="true">
          4<span>0</span>4
        </div>

        <div className="notfound-copy">
          <span className="eyebrow">
            <span className="dot" />
            404 · route not found
          </span>
          <h1 className="display-2">
            This path returns <span className="serif">nothing.</span>
          </h1>
          <p className="lede">
            The page you asked for is not in the routing table. It may have moved, or it
            may never have existed. The good stuff is still one hop away.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/">
              <HomeIcon width={14} height={14} />
              Back home
            </Link>
            <Link className="btn btn-ghost" href="/systems">
              Systems index
              <ArrowRight width={14} height={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
