import { useState } from 'react';
import Header from './components/Header';
import ApiScannerInput from './components/ApiScannerInput';
import EndpointSelector from './components/EndpointSelector';
import DynamicFormBuilder from './components/DynamicFormBuilder';
import LivePayloadTerminal from './components/LivePayloadTerminal';

// 🔧 Replace this with your actual n8n webhook URL if needed
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;



export default function App() {
  const [baseUrl, setBaseUrl] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // payload is now categorized: { headers: {}, pathParams: {}, queryParams: {}, body: {} }
  const [payload, setPayload] = useState({ headers: {}, pathParams: {}, queryParams: {}, body: {} });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const initPayloadForEndpoint = (ep) => {
    const newPayload = { headers: {}, pathParams: {}, queryParams: {}, body: {} };

    // Initialize booleans to false and enums to empty string
    const initFields = (fields, target) => {
      if (!fields) return;
      fields.forEach(f => {
        if (f.type === 'boolean') target[f.name] = false;
        else if (f.type === 'enum') target[f.name] = '';
      });
    };

    initFields(ep.headers, newPayload.headers);
    initFields(ep.pathParams, newPayload.pathParams);
    initFields(ep.queryParams, newPayload.queryParams);
    initFields(ep.bodyFields, newPayload.body);

    setPayload(newPayload);
  };

  const handleScan = async (url) => {
    setError(null);

    if (!url.trim()) {
      setError('Please enter a URL first.');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (include https://).');
      return;
    }

    setIsLoading(true);
    setBaseUrl('');
    setEndpoints([]);
    setPayload({ headers: {}, pathParams: {}, queryParams: {}, body: {} });

    const loadingMessages = [
      "Reading the docs so you don't have to...",
      "Finding all the endpoints (there's a lot bestie)...",
      "Figuring out what's required vs optional...",
      "Almost done, just double checking for you..."
    ];
    setLoadingMessage(loadingMessages[0]);
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 3000);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000);

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      let rawText = await res.text();
      let data;
      let isRepaired = false;

      // Strip markdown wrapping or conversational text
      const markdownMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/);
      if (markdownMatch && markdownMatch[1]) {
        rawText = markdownMatch[1].trim();
      }
      
      const firstBrace = rawText.indexOf('{');
      const firstBracket = rawText.indexOf('[');
      const firstValid = Math.min(
        firstBrace === -1 ? Infinity : firstBrace,
        firstBracket === -1 ? Infinity : firstBracket
      );
      if (firstValid !== Infinity) {
        rawText = rawText.substring(firstValid);
      }

      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        try {
          console.log("Standard JSON parse failed, attempting jsonrepair...");
          const { jsonrepair } = await import('jsonrepair');
          const repairedText = jsonrepair(rawText);
          data = JSON.parse(repairedText);
          isRepaired = true;
          console.log("Successfully repaired JSON:", data);
        } catch (repairErr) {
          console.error("jsonrepair failed:", repairErr);
          throw new Error('Something went wrong, please try again');
        }
      }

      // If n8n explicitly passed an error with the raw text, extract it and repair it
      const findRawError = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.error && typeof obj.raw === 'string') return obj;
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = findRawError(item);
            if (found) return found;
          }
        }
        if (obj.data) return findRawError(obj.data);
        if (obj.body) return findRawError(obj.body);
        if (obj.json) return findRawError(obj.json);
        return null;
      };

      const rawErrorObj = findRawError(data);
      if (rawErrorObj) {
        console.log("n8n passed an error object with raw text. Attempting to repair...");
        try {
          let rawUnparsed = rawErrorObj.raw;
          const mdMatch = rawUnparsed.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/);
          if (mdMatch && mdMatch[1]) {
            rawUnparsed = mdMatch[1].trim();
          }
          
          // Always strip conversational prefix before the first '{' or '['
          const firstBrace = rawUnparsed.indexOf('{');
          const firstBracket = rawUnparsed.indexOf('[');
          const firstValid = Math.min(
            firstBrace === -1 ? Infinity : firstBrace,
            firstBracket === -1 ? Infinity : firstBracket
          );
          if (firstValid !== Infinity) {
            rawUnparsed = rawUnparsed.substring(firstValid);
          }
          
          const { jsonrepair } = await import('jsonrepair');
          const repairedText = jsonrepair(rawUnparsed);
          data = JSON.parse(repairedText);
          isRepaired = true;
          console.log("Successfully repaired n8n raw error text");
        } catch (e) {
          console.error("jsonrepair failed on n8n raw data:", e);
          throw new Error(`n8n failed to parse: ${rawErrorObj.error} (Repair also failed: ${e.message})`);
        }
      }

      // Deep search for the object containing endpoints
      const findEndpoints = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        if (Array.isArray(obj.endpoints)) return obj;
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const found = findEndpoints(item);
            if (found) return found;
          }
        }
        if (obj.data) return findEndpoints(obj.data);
        if (obj.body) return findEndpoints(obj.body);
        if (obj.json) return findEndpoints(obj.json);
        return null;
      };

      data = findEndpoints(data) || data;

      if (!data || !data.endpoints || !Array.isArray(data.endpoints)) {
        console.error("Final parsed data object:", data);
        const keys = typeof data === 'object' && data !== null ? Object.keys(data).join(', ') : typeof data;
        throw new Error(`Unexpected response format from n8n. Received keys: ${keys}`);
      }

      setBaseUrl(data.baseUrl || '');
      setEndpoints(data.endpoints);
      setSelectedIndex(0);
      if (data.endpoints[0]) {
        initPayloadForEndpoint(data.endpoints[0]);
      }

      clearInterval(intervalId);
      setLoadingMessage("Okay we're cooked. Here you go! 🎉");
      
      if (isRepaired) {
        setError('Partial results shown due to LLM truncated response.');
      }

      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage('');
      }, 2000);

    } catch (err) {
      clearInterval(intervalId);
      if (err.name === 'AbortError') {
        setError('we have so many request at the moment. please try again');
      } else {
        setError(err.message.includes('Something went wrong') ? err.message : 'Failed to scan: ' + err.message);
      }
      setBaseUrl('');
      setEndpoints([]);
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSelectEndpoint = (index) => {
    setSelectedIndex(index);
    if (endpoints[index]) {
      initPayloadForEndpoint(endpoints[index]);
    }
  };

  const handlePayloadChange = (category, field, value) => {
    setPayload(prev => {
      const newCategory = { ...prev[category] };
      if (value === undefined || value === '') {
        delete newCategory[field];
      } else {
        newCategory[field] = value;
      }
      return { ...prev, [category]: newCategory };
    });
  };

  const activeEndpoint = endpoints[selectedIndex] || null;

  return (
    <>
      <Header />
      <main className="max-w-[1280px] mx-auto p-[28px_24px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-[16px]">
            <ApiScannerInput
              onScan={handleScan}
              isLoading={isLoading}
              error={error}
              loadingMessage={loadingMessage}
            />
            <EndpointSelector
              baseUrl={baseUrl}
              endpoints={endpoints}
              selectedIndex={selectedIndex}
              onSelect={handleSelectEndpoint}
            />
            <DynamicFormBuilder
              endpoint={activeEndpoint}
              payload={payload}
              onPayloadChange={handlePayloadChange}
              isLoading={isLoading}
              hasScanned={endpoints.length > 0}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="sticky top-[80px] h-[calc(100vh-100px)]">
            <LivePayloadTerminal baseUrl={baseUrl} endpoint={activeEndpoint} payload={payload} />
          </div>
        </div>
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '24px 16px',
        color: 'rgba(0, 0, 0, 0.35)',
        fontSize: '13px',
        letterSpacing: '0.5px',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        marginTop: '0',
      }}>
        APIlot by Spawny-Jelly (ranfarrr)
      </footer>
    </>
  );
}
