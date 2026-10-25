export function Split({ text, start = 0 }: { text: string; start?: number }) {
  let n = 0;
  return (
    <>
      {text.split(" ").map((word, w, words) => (
        <span className="word" key={`${word}-${w}`} aria-hidden="true">
          {word.split("").map((char, i) => (
            <span key={`${char}-${i}`} className="ch" style={{ "--i": start + n++ } as React.CSSProperties}>
              {char}
            </span>
          ))}
          {w < words.length - 1 ? <span className="ch" style={{ "--i": start + n++ } as React.CSSProperties}>{"\u00a0"}</span> : null}
        </span>
      ))}
    </>
  );
}
