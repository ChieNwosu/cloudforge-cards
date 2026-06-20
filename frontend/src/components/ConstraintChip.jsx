const COLOR_CLASSES = {
  yellow: "bg-[#FFD500]/15 border-[#FFD500]/40 text-[#FFD500]",
  blue:   "bg-[#0055FF]/15 border-[#0055FF]/50 text-[#5C8CFF]",
  green:  "bg-[#00E676]/15 border-[#00E676]/40 text-[#00E676]",
  red:    "bg-[#FF3333]/15 border-[#FF3333]/40 text-[#FF6666]",
};

export default function ConstraintChip({ constraint, active = true, onClick }) {
  const classes = COLOR_CLASSES[constraint.color] || COLOR_CLASSES.blue;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      data-testid={`constraint-chip-${constraint.id}`}
      title={constraint.description}
      className={`px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-[0.1em] ${classes} ${
        active ? "" : "opacity-40"
      } ${onClick ? "hover:scale-105 active:scale-95 transition-transform" : ""}`}
    >
      {constraint.name}
    </Tag>
  );
}
