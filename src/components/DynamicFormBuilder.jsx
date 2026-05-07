export default function DynamicFormBuilder({ endpoint, payload, onPayloadChange, isLoading, hasScanned }) {
  const formatLabel = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleInputChange = (category, field, value) => {
    onPayloadChange(category, field, value);
  };

  const renderEmptyState = () => (
    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-[40px_20px]">
      <div className="w-[52px] h-[52px] rounded-full bg-[#f0f0ee] flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] text-[#aaa]">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      </div>
      <p className="font-medium text-text mb-1.5 text-[14px]">Awaiting API Schema...</p>
      <p className="text-[13px] text-text-muted max-w-[240px] leading-relaxed">
        Enter a documentation URL above and click Scan Docs to generate form fields.
      </p>
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className="p-[18px]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col mb-[14px]">
          <div className="skeleton-bg rounded-md h-[12px] w-[35%] mb-[5px] animate-shimmer"></div>
          <div className="skeleton-bg rounded-md h-[36px] w-full animate-shimmer"></div>
        </div>
      ))}
    </div>
  );

  const renderField = (category, field) => {
    const value = payload[category]?.[field.name];
    const baseInputClasses = "w-full py-2 px-[11px] border border-border-strong rounded-sm bg-[#f9f9f8] font-sans text-[13.5px] text-text outline-none transition-all duration-150 focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)] focus:bg-white";

    if (field.type === 'boolean') {
      return (
        <div className="flex items-center gap-[10px] flex-row mt-1">
          <input
            id={`field-${category}-${field.name}`}
            type="checkbox"
            className="w-4 h-4 cursor-pointer accent-accent"
            checked={!!value}
            onChange={(e) => handleInputChange(category, field.name, e.target.checked)}
          />
          <label htmlFor={`field-${category}-${field.name}`} className="font-normal text-text-muted text-[13px] cursor-pointer">
            {field.description || formatLabel(field.name)}
          </label>
        </div>
      );
    }

    if (field.type === 'enum' && field.enum) {
      return (
        <select
          id={`field-${category}-${field.name}`}
          className={baseInputClasses}
          value={value || ''}
          onChange={(e) => handleInputChange(category, field.name, e.target.value || undefined)}
        >
          <option value="">Select {formatLabel(field.name)}...</option>
          {field.enum.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          id={`field-${category}-${field.name}`}
          className={`${baseInputClasses} resize-y min-h-[72px]`}
          placeholder={field.description || ''}
          value={value || ''}
          onChange={(e) => handleInputChange(category, field.name, e.target.value || undefined)}
        />
      );
    }

    const typeMapping = { number: 'number', date: 'date' };

    return (
      <input
        id={`field-${category}-${field.name}`}
        type={typeMapping[field.type] || 'text'}
        className={baseInputClasses}
        placeholder={field.description || formatLabel(field.name)}
        value={value || ''}
        onChange={(e) => {
          const val = field.type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : (e.target.value || undefined);
          handleInputChange(category, field.name, val);
        }}
      />
    );
  };

  const renderSection = (title, fields, category) => {
    if (!fields || fields.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h3 className="font-display text-[12px] uppercase tracking-wider text-text-muted font-bold mb-3 border-b border-border pb-1">
          {title}
        </h3>
        <div className="flex flex-col gap-[14px]">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-[5px]">
              {field.type !== 'boolean' && (
                <label htmlFor={`field-${category}-${field.name}`} className="text-[12.5px] font-medium text-text flex items-center gap-[5px]">
                  <span>{formatLabel(field.name)}</span>
                  {field.required && <span className="text-[10px] py-[1px] px-[5px] rounded-[4px] bg-[#fee2e2] text-[#dc2626] font-semibold">required</span>}
                  <span className="text-[10px] py-[1px] px-[5px] rounded-[4px] bg-accent-light text-accent font-medium font-mono">{field.type}</span>
                </label>
              )}
              {renderField(category, field)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalFields = endpoint ? 
    (endpoint.headers?.length || 0) + 
    (endpoint.pathParams?.length || 0) + 
    (endpoint.queryParams?.length || 0) + 
    (endpoint.bodyFields?.length || 0) 
    : 0;

  return (
    <div className="bg-surface border border-border rounded flex-1 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
      <div className="p-[14px_18px] border-b border-border flex items-center justify-between bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px] text-accent">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h2 className="font-display text-[13.5px] font-semibold">
            {endpoint ? `Parameters: ${endpoint.name}` : 'Generated Form Fields'}
          </h2>
        </div>
        <span className="text-[11.5px] py-[2px] px-[8px] rounded-full bg-[#f0f0ee] text-text-muted font-medium">
          {totalFields} field{totalFields !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          renderLoadingSkeleton()
        ) : !hasScanned ? (
          renderEmptyState()
        ) : endpoint ? (
          <div className="p-[18px] animate-fade-in">
            {renderSection('Headers', endpoint.headers, 'headers')}
            {renderSection('Path Parameters', endpoint.pathParams, 'pathParams')}
            {renderSection('Query Parameters', endpoint.queryParams, 'queryParams')}
            {renderSection('Body Payload', endpoint.bodyFields, 'body')}
          </div>
        ) : (
          <div className="p-[18px] text-center text-text-muted text-[13px]">
            Please select an endpoint.
          </div>
        )}
      </div>
    </div>
  );
}
