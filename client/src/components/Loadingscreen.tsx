export const LoadingScreen: React.FC = () => (
  <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center gap-4">
    <img src="/loading.png" alt="Loading" className="w-64 h-48" />
    <p className="text-muted text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
      Loading...
    </p>
  </div>
);
