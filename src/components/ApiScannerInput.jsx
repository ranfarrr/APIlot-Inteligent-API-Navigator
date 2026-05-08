import { useState } from 'react';

export default function ApiScannerInput({ onScan, isLoading, error, loadingMessage }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onScan(url);
  };

  return (
    <div className="bg-surface border border-border rounded p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <label htmlFor="url-input" className="block text-[13px] font-medium text-text mb-[10px]">
        API Documentation URL
      </label>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-muted pointer-events-none">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="url-input"
            type="url"
            className="w-full py-[9px] px-[12px] pl-[34px] border border-border-strong rounded-sm bg-[#f9f9f8] font-sans text-[13.5px] text-text outline-none transition-all duration-150 placeholder:text-[#aaa] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.12)] focus:bg-white"
            placeholder="https://api.example.com/docs"
            autoComplete="off"
            spellCheck="false"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="px-[18px] py-[9px] rounded-sm bg-accent text-white border-none cursor-pointer font-display text-[13.5px] font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-[6px] hover:bg-accent-hover active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="w-[13px] h-[13px] border-2 border-white/30 border-t-white rounded-full animate-spin-slow"></div>
          ) : (
            <span>Scan Docs</span>
          )}
        </button>
      </form>
      {isLoading && loadingMessage && !error && (
        <>
          <div className="mt-3 p-[10px_14px] rounded-sm bg-accent-light border border-accent/20 text-accent text-[13px] animate-fade-in font-medium flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin-slow"></div>
            {loadingMessage}
          </div>
          <p className="mt-2 text-[12px] text-text-muted text-center animate-fade-in" style={{ opacity: 0.7 }}>
            ⏳ Please wait, result may take up to 2 minutes to show
          </p>
        </>
      )}
      {error && (
        <div className="mt-3 p-[10px_14px] rounded-sm bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[13px] animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
