export default function Header() {
  return (
    <div className="sticky top-0 z-50">
      <header className="bg-surface border-b border-border px-6 h-[60px] flex items-center">
        <div className="max-w-[1280px] mx-auto w-full flex items-center gap-3">
          <img src="/logo.png" alt="APIlot Logo" className="w-9 h-9 rounded-[9px] object-cover shrink-0" />
          <div>
            <h1 className="font-display text-[15px] font-bold leading-tight tracking-[-0.01em]">APIlot: Read Less, Build More</h1>
            <p className="text-[12px] text-text-muted font-normal">AI-Powered API Navigator. Paste any API doc URL to instantly extract endpoints and available fields.</p>
          </div>
        </div>
      </header>
      {/* Demo disclaimer banner */}
      <div className="border-b px-6 py-[6px] flex items-center justify-center gap-2" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px] shrink-0" style={{ color: '#f59e0b' }}>
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <p className="text-[11.5px] font-medium" style={{ color: '#b45309' }}>
          <span className="font-semibold">Demo Notice:</span> Results may vary and may be truncated compared to the video demo due to different LLM infrastructure.
        </p>
      </div>
    </div>
  );
}
