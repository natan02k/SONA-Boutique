type GoldDividerProps = {
  withDiamond?: boolean;
  className?: string;
};

export function GoldDivider({ withDiamond = true, className = "" }: GoldDividerProps) {
  if (!withDiamond) {
    return (
      <div
        className={`my-6 h-px w-full bg-gradient-to-r from-transparent via-[#C5A880] to-transparent ${className}`}
      />
    );
  }

  return (
    <div className={`relative my-6 flex items-center justify-center ${className}`}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C5A880]/60 to-transparent" />
      <span className="absolute bg-[#FAF9F6] px-3 text-[10px] text-[#C5A880] select-none">♦</span>
    </div>
  );
}
