"use client";

type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center border border-[#E8E5DC] bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="px-3 py-1.5 text-xs text-[#1A1A1A] transition-colors hover:bg-[#F5F4EE] disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Anzahl verringern"
      >
        −
      </button>
      <span className="min-w-[32px] px-4 py-1.5 text-center font-mono text-xs font-semibold text-[#1A1A1A] select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="px-3 py-1.5 text-xs text-[#1A1A1A] transition-colors hover:bg-[#F5F4EE] disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Anzahl erhöhen"
      >
        +
      </button>
    </div>
  );
}
