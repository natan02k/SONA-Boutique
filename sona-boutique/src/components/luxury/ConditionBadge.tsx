type ConditionType = "PRISTINE" | "EXCELLENT" | "VERY_GOOD" | "GOOD";

type ConditionBadgeProps = {
  condition: ConditionType | string;
  className?: string;
};

const conditionMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PRISTINE: {
    label: "Neuwertig",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  EXCELLENT: {
    label: "Hervorragend",
    bg: "bg-[#F5F4EE]",
    text: "text-[#1A1A1A]",
    border: "border-[#C5A880]",
  },
  VERY_GOOD: {
    label: "Sehr gut",
    bg: "bg-stone-100",
    text: "text-stone-800",
    border: "border-stone-200",
  },
  GOOD: {
    label: "Gut",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
};

export function ConditionBadge({ condition, className = "" }: ConditionBadgeProps) {
  const config = conditionMap[condition] || {
    label: condition,
    bg: "bg-stone-100",
    text: "text-stone-800",
    border: "border-stone-200",
  };

  return (
    <span
      className={`inline-flex items-center border px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-widest uppercase ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
}
