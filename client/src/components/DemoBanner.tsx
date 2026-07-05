export function DemoBanner() {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#f59e0b',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: '20px',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
      Demo mode
    </div>
  );
}
