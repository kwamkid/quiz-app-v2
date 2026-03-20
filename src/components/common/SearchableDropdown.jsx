import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SEARCH_THRESHOLD = 7;

export default function SearchableDropdown({
  value,
  onChange,
  options,
  placeholder = '-- เลือก --',
  disabled = false,
  style = {},
  iconLeft = null,
  greenTheme = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const showSearch = options.length > SEARCH_THRESHOLD;

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = showSearch && searchText
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchText.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const triggerStyle = greenTheme
    ? {
        width: '100%',
        padding: '10px 14px',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '2px solid #22c55e',
        borderRadius: '10px',
        color: 'white',
        fontSize: '0.9rem',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }
    : {
        width: '100%',
        padding: iconLeft ? '12px 16px 12px 44px' : '12px 16px',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchText('');
          }
        }}
        style={{ ...triggerStyle, ...style }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
          opacity: selectedOption ? 1 : 0.6,
        }}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            opacity: 0.6,
          }}
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#1f2937',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          zIndex: 9999,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Search Input - only when > 7 options */}
          {showSearch && (
            <div style={{
              padding: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
            }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
              }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ค้นหา..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              />
            </div>
          )}

          {/* Options List */}
          <div style={{
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
          }}>
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.9rem',
              }}>
                ไม่พบรายการ
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value ?? idx}
                    onClick={() => {
                      const parsed = options.some((o) => typeof o.value === 'number')
                        ? (typeof opt.value === 'number' ? opt.value : parseInt(opt.value, 10))
                        : opt.value;
                      onChange(parsed);
                      setIsOpen(false);
                      setSearchText('');
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      background: isSelected
                        ? 'rgba(139, 92, 246, 0.3)'
                        : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.target.style.background = 'transparent';
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
