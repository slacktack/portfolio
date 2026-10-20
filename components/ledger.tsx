import type { CSSProperties } from "react";
import { StackTag } from "@/components/brand";
import { Reveal } from "@/components/reveal";
import { ledger, type LedgerEntry } from "@/lib/site";

const groups: { key: LedgerEntry["group"]; title: string; note: string }[] = [
  { key: "work", title: "At Buyhatke", note: "Authored commits against each repo's total." },
  { key: "personal", title: "After hours", note: "Built for the fun of it, then kept honest." },
];

function Row({ entry, index }: { entry: LedgerEntry; index: number }) {
  const share = entry.total ? Math.max(2, Math.round((entry.mine / entry.total) * 100)) : 0;
  const style = { "--to": entry.mine, "--share": `${share}%`, "--i": index } as CSSProperties;

  return (
    <li className="ledger-row" style={style}>
      <div className="ledger-main">
        <h3>{entry.name}</h3>
        <p>{entry.line}</p>
        <div className="ledger-tags">
          {entry.stack.map((tag) => (
            <StackTag name={tag} key={tag} />
          ))}
        </div>
      </div>

      <p className="ledger-proof">{entry.proof}</p>

      <div className="ledger-meter">
        {entry.total ? (
          <>
            <b className="meter-n" aria-label={`${entry.mine} commits`} />
            <span className="meter-of">
              of {entry.total.toLocaleString("en-IN")} commits
            </span>
            <span className="meter-bar" aria-hidden="true">
              <i />
            </span>
          </>
        ) : (
          <span className="meter-of">Local build</span>
        )}
        {entry.span ? <span className="meter-span">{entry.span}</span> : null}
      </div>
    </li>
  );
}

export function Ledger({ personalLimit }: { personalLimit?: number }) {
  return (
    <div className="ledger">
      {groups.map((group) => (
        <Reveal key={group.key}>
          <div className="ledger-group">
            <div className="ledger-head">
              <h3>{group.title}</h3>
              <span>{group.note}</span>
            </div>
            <ul className="ledger-list">
              {ledger
                .filter((entry) => entry.group === group.key)
                .slice(0, group.key === "personal" ? personalLimit : undefined)
                .map((entry, index) => (
                  <Row entry={entry} index={index} key={entry.name} />
                ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
