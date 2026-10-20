type MarqueeProps = {
  items: string[];
  ariaLabel?: string;
};

export function Marquee({ items, ariaLabel = "Selected production metrics" }: MarqueeProps) {
  const group = (
    <div className="marquee-group" aria-hidden="true">
      {items.map((item) => (
        <span className="marquee-item" key={item}>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" role="region" aria-label={ariaLabel}>
      <div className="marquee-track">
        {group}
        {group}
      </div>
    </div>
  );
}
