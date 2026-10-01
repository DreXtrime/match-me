export function DemoBanner() {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;

  return (
    <div
      className="flex items-center gap-1.5 bg-surface/30 border border-yellow-hot text-black text-xs font-bold px-2.5 py-1 select-none whitespace-nowrap"
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      <span className="w-1.5 h-1.5 bg-yellow shrink-0" />
      Demo mode enabled
    </div>
  );
}
