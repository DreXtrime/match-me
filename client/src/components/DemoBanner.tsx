export function DemoBanner() {
    if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 9999,
            backgroundColor: '#1a1a1a',
            color: '#e5e5e5',
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            userSelect: 'none',
            pointerEvents: 'none',
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
            Demo — data resets on refresh
        </div>
    );
}