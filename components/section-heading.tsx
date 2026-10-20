type SectionLabelProps = {
  number: string;
  children: React.ReactNode;
};

export function SectionLabel({ number, children }: SectionLabelProps) {
  return (
    <div className="section-label mono">
      <span className="num">{number}</span>
      <span className="line" />
      <span>{children}</span>
    </div>
  );
}

type SectionHeadingProps = {
  number: string;
  label: string;
  title: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
  id?: string;
};

export function SectionHeading({
  number,
  label,
  title,
  note,
  className = "",
  id,
}: SectionHeadingProps) {
  return (
    <div className={`section-head ${className}`.trim()} id={id}>
      <div className="head-copy">
        <SectionLabel number={number}>{label}</SectionLabel>
        <h2 className="display-2 section-title">
          {title}
        </h2>
        {note ? <p className="head-note">{note}</p> : null}
      </div>
    </div>
  );
}
