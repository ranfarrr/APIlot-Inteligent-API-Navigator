import { useState } from 'react';

export default function EndpointSelector({ baseUrl, endpoints, selectedIndex, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!endpoints || endpoints.length === 0) return null;

  const methodColors = {
    GET: 'bg-emerald-100 text-emerald-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-rose-100 text-rose-700',
    PATCH: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-surface border border-border rounded shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-[14px_18px] border-b border-border flex flex-col gap-1">
        <h2 className="font-display text-[13.5px] font-semibold flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px] text-accent">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Select Endpoint
        </h2>
        {baseUrl && (
          <div className="text-[11.5px] text-text-muted font-mono flex items-center gap-1.5 opacity-80 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px]">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            {baseUrl}
          </div>
        )}
      </div>
      <div className="p-[10px]">
        {(isExpanded ? endpoints.map((ep, idx) => ({ ep, idx })) : [{ ep: endpoints[selectedIndex], idx: selectedIndex }]).map(({ ep, idx }) => {
          if (!ep) return null;
          const isSelected = idx === selectedIndex;
          const methodClass = methodColors[ep.method] || 'bg-gray-100 text-gray-700';

          const handleClick = () => {
            if (isSelected) {
              setIsExpanded(!isExpanded);
            } else {
              onSelect(idx);
              setIsExpanded(false);
            }
          };

          return (
            <button
              key={idx}
              onClick={handleClick}
              className={`w-full text-left px-[14px] py-[10px] rounded-[6px] mb-1 last:mb-0 transition-all flex items-center justify-between gap-3 ${isSelected ? 'bg-accent/5 ring-1 ring-accent/20' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] font-mono ${methodClass}`}>
                  {ep.method}
                </span>
                <div className="flex flex-col">
                  <span className={`text-[13.5px] font-medium ${isSelected ? 'text-accent' : 'text-text'}`}>
                    {ep.name}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono mt-[2px]">
                    {ep.path}
                  </span>
                </div>
              </div>
              <div className="text-text-muted flex shrink-0">
                {isSelected ? (
                  isExpanded ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
