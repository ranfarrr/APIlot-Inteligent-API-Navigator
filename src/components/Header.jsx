export default function Header() {
  return (
    <header className="bg-surface border-b border-border px-6 h-[60px] flex items-center sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto w-full flex items-center gap-3">
        <img src="/logo.png" alt="APIlot Logo" className="w-9 h-9 rounded-[9px] object-cover shrink-0" />
        <div>
          <h1 className="font-display text-[15px] font-bold leading-tight tracking-[-0.01em]">APIlot: Read Less, Build More</h1>
          <p className="text-[12px] text-text-muted font-normal">AI-Powered API Navigator. Paste any API doc URL to instantly extract endpoints and available fields.</p>
        </div>
      </div>
    </header>
  );
}
