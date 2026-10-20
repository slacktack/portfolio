export function Split({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="ch"
          style={{ "--i": start + i } as React.CSSProperties}
          aria-hidden="true"
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </>
  );
}
