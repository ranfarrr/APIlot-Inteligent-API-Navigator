import { useState, useEffect } from 'react';

export default function LivePayloadTerminal({ baseUrl, endpoint, payload }) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [lineNumbers, setLineNumbers] = useState([]);
  const [rawRequestText, setRawRequestText] = useState('');

  useEffect(() => {
    if (!endpoint) {
      setHighlightedCode('<span class="syntax-jnl">Awaiting endpoint selection...</span>');
      setLineNumbers([1]);
      setRawRequestText('');
      return;
    }

    // 1. Build Method & Path
    let rawPath = endpoint.path;
    let hlPath = endpoint.path;
    
    // Concatenate with baseUrl if it exists
    if (baseUrl) {
      const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
      rawPath = `${cleanBase}${cleanPath}`;
      hlPath = `${cleanBase}${cleanPath}`;
    }

    // Replace path parameters (e.g. {do_number})
    if (payload.pathParams) {
      Object.entries(payload.pathParams).forEach(([key, val]) => {
        rawPath = rawPath.replace(`{${key}}`, val);
        hlPath = hlPath.replace(`{${key}}`, `\uE000${val}\uE001`);
      });
    }

    // Append query parameters
    if (payload.queryParams && Object.keys(payload.queryParams).length > 0) {
      const rawQueryArr = [];
      const hlQueryArr = [];
      Object.entries(payload.queryParams).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          rawQueryArr.push(`${k}=${v}`);
          hlQueryArr.push(`${k}=\uE000${v}\uE001`);
        }
      });
      if (rawQueryArr.length > 0) {
        rawPath += `?${rawQueryArr.join('&')}`;
        hlPath += `?${hlQueryArr.join('&')}`;
      }
    }

    let rawRequestStr = `${endpoint.method} ${rawPath}\n`;
    let hlRequestStr = `${endpoint.method} ${hlPath}\n`;

    // 2. Build Headers
    if (payload.headers && Object.keys(payload.headers).length > 0) {
      Object.entries(payload.headers).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          rawRequestStr += `${k}: ${v}\n`;
          hlRequestStr += `${k}: \uE000${v}\uE001\n`;
        }
      });
    }

    // 3. Build Body (if applicable)
    if (endpoint.bodyFields && endpoint.bodyFields.length > 0 && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      rawRequestStr += '\n'; // Empty line between headers and body
      hlRequestStr += '\n';
      const rawBody = JSON.stringify(payload.body, null, 2);
      rawRequestStr += rawBody;
      hlRequestStr += rawBody;
    }

    setRawRequestText(rawRequestStr);

    const lines = rawRequestStr.split('\n');
    setLineNumbers(lines.map((_, i) => i + 1));

    // Custom Highlighting for HTTP + JSON
    let highlighted = hlRequestStr
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Highlight the Method line
    highlighted = highlighted.replace(/^(GET|POST|PUT|DELETE|PATCH) (.*)$/m, (match, p1, p2) => {
      const methodColor = 
        p1 === 'GET' ? '#34d399' : // emerald-400
        p1 === 'POST' ? '#60a5fa' : // blue-400
        p1 === 'PUT' ? '#fbbf24' : // amber-400
        p1 === 'DELETE' ? '#fb7185' : // rose-400
        '#c084fc'; // purple-400
      return `<span style="color: ${methodColor}; font-weight: bold;">${p1}</span> <span style="color: #c9d1d9;">${p2}</span>`;
    });

    // Highlight Headers (anything before double newline that looks like Key: Value)
    highlighted = highlighted.replace(/^([\w-]+):\s*(.*)$/gm, '<span style="color: #79b8ff;">$1:</span> <span style="color: #9ecbff;">$2</span>');

    // Convert tokens to spans
    highlighted = highlighted.replace(/\uE000(.*?)\uE001/g, '<span class="syntax-dynamic">$1</span>');

    // Highlight JSON body part (basic heuristic: after the first '{')
    // We treat all JSON values as dynamic user inputs
    highlighted = highlighted
      .replace(/"([^"]+)":/g, '<span class="syntax-jk">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="syntax-js syntax-dynamic">"$1"</span>')
      .replace(/: (true|false)/g, ': <span class="syntax-jb syntax-dynamic">$1</span>')
      .replace(/: null/g, ': <span class="syntax-jnl syntax-dynamic">null</span>')
      .replace(/: (-?\d+\.?\d*)/g, ': <span class="syntax-jn syntax-dynamic">$1</span>');

    setHighlightedCode(highlighted);

  }, [endpoint, payload]);

  const handleCopy = () => {
    if (!rawRequestText) return;
    navigator.clipboard.writeText(rawRequestText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-terminal-bg rounded border border-terminal-border overflow-hidden flex flex-col h-full max-h-full">
      <div className="p-[11px_16px] bg-[#0a0c12] border-b border-terminal-border flex items-center gap-[12px]">
        <div className="flex gap-[6px]">
          <div className="w-[11px] h-[11px] rounded-full bg-terminal-red"></div>
          <div className="w-[11px] h-[11px] rounded-full bg-terminal-yellow"></div>
          <div className="w-[11px] h-[11px] rounded-full bg-terminal-green"></div>
        </div>
        <div className="flex-1 text-center font-mono text-[12px] text-terminal-dim">
          http-request.txt
        </div>
        <button 
          onClick={handleCopy}
          className={`p-[4px_10px] rounded-[5px] bg-white/5 border text-terminal-dim font-mono text-[11px] cursor-pointer transition-all duration-150 flex items-center gap-[5px] hover:bg-white/10 hover:text-terminal-text ${copied ? 'text-terminal-green border-terminal-green' : 'border-white/10'}`}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="flex-1 p-[18px] overflow-y-auto overflow-x-auto flex gap-0">
        <div className="select-none text-terminal-dim font-mono text-[13px] leading-[1.7] text-right pr-[16px] border-r border-terminal-border mr-[16px] min-w-[28px]">
          {lineNumbers.map(n => <div key={n}>{n}</div>)}
        </div>
        <div 
          className="font-mono text-[13px] leading-[1.7] text-terminal-text whitespace-pre flex-1"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>

      <div className="p-[8px_16px] bg-[#0a0c12] border-t border-terminal-border flex items-center justify-between font-mono text-[11px] text-terminal-dim">
        <span className="w-[100px]">UTF-8 · HTTP</span>
        <span className="flex-1 text-center text-white/40 hidden sm:block">APIlot is an AI and can make mistakes. Please double-check.</span>
        <span className="w-[100px] justify-end flex items-center gap-[5px] before:content-[''] before:inline-block before:w-[6px] before:h-[6px] before:rounded-full before:bg-terminal-green">
          {endpoint ? 'Ready' : 'Waiting'}
        </span>
      </div>
    </div>
  );
}
